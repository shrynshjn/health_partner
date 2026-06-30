# Workout Enrichment — Implementation Plan

## Goal

Two parallel changes:
1. **Expand workout types** — current enum (yoga / running / walking / cycling / gym) covers ~5% of what HealthKit supports
2. **Add `metadata` field** — platform-namespaced object for source-specific data (Apple Health today, Google Fit / Health Connect later). Core schema stays lean; extra fields live inside metadata.

---

## 1. Expanded Workout Types

Replace the current 5-value enum with a comprehensive set. Keep `gym` for backwards compatibility (existing records), but `strength_training` is the new preferred term for new entries.

```ts
export const WORKOUT_TYPES = [
  // Cardio
  'running', 'walking', 'cycling', 'swimming', 'hiking',
  'elliptical', 'rowing', 'stair_climbing', 'jump_rope', 'mixed_cardio',
  // Strength & HIIT
  'strength_training', 'hiit', 'cross_training', 'crossfit',
  'core_training', 'functional_training',
  // Mind & Body
  'yoga', 'pilates', 'barre', 'stretching', 'tai_chi', 'meditation',
  // Racket & Court
  'tennis', 'badminton', 'squash', 'table_tennis', 'pickleball', 'padel', 'racquetball',
  // Team sports
  'soccer', 'basketball', 'volleyball', 'rugby', 'cricket',
  'hockey', 'handball', 'baseball', 'softball',
  // Combat
  'boxing', 'martial_arts', 'kickboxing', 'wrestling',
  // Outdoor / Adventure
  'climbing', 'skiing', 'snowboarding', 'surfing', 'paddling',
  // Other
  'golf', 'dance', 'gymnastics', 'track_and_field', 'cycling_indoor',
  'gym',   // kept for backwards compat — prefer strength_training for new entries
  'other',
] as const;

export type WorkoutType = typeof WORKOUT_TYPES[number];
```

**Files to change:**
- `workout.schema.ts` — update `enum: [...]` on the `type` Prop
- `create-workout.dto.ts` — update `@IsEnum(WORKOUT_TYPES)` and `@ApiProperty enum`
- `query-workout.dto.ts` — add optional `type` filter param

---

## 2. `metadata` Field — Platform-Namespaced

```ts
// Structure stored in DB — each platform key is optional
interface WorkoutMetadata {
  appleHealth?: AppleHealthWorkoutMeta;
  googleFit?: GoogleFitWorkoutMeta;   // future
  healthConnect?: HealthConnectMeta;  // future (Android Health Connect)
}

interface AppleHealthWorkoutMeta {
  // Available directly from HKWorkout (no extra query)
  isIndoor?: boolean;                   // HKMetadataKeyIndoorWorkout
  avgMETs?: number;                     // HKMetadataKeyAverageMETs
  elevationAscendedMeters?: number;     // HKMetadataKeyElevationAscended
  elevationDescendedMeters?: number;    // HKMetadataKeyElevationDescended
  avgSpeedMps?: number;                 // HKMetadataKeyAverageSpeed
  maxSpeedMps?: number;                 // HKMetadataKeyMaximumSpeed
  weatherCondition?: string;            // HKMetadataKeyWeatherCondition (Sunny, Cloudy, etc.)
  weatherTempCelsius?: number;          // HKMetadataKeyWeatherTemperature
  strokeCount?: number;                 // totalSwimmingStrokeCount — swimming only
  swimmingLocationType?: 'pool' | 'openWater'; // HKMetadataKeySwimmingLocationType
  lapLength?: number;                   // HKMetadataKeyLapLength (meters) — swimming
  laps?: number;                        // count of .lap events in workoutEvents

  // Requires separate HKStatisticsCollectionQuery over workout interval
  minHeartRate?: number;                // bpm
  maxHeartRate?: number;                // bpm
  cadence?: number;                     // steps/min (running) or RPM (cycling)
  vo2Max?: number;                      // mL/kg/min — Apple Watch estimated
}

// Placeholder — to be defined when Google Fit sync is built
interface GoogleFitWorkoutMeta {
  activitySegments?: number;
  stepCadence?: number;
  powerWatts?: number;
}
```

**Mongoose schema** — use `Schema.Types.Mixed` so the shape is flexible without migrations when new fields are added:

```ts
@Prop({ type: Schema.Types.Mixed, default: {} })
metadata?: Record<string, any>;
```

**DTO** — validate loosely with `IsObject()` since the internals vary by platform:

```ts
@ApiPropertyOptional({ description: 'Platform-specific workout metadata' })
@IsOptional()
@IsObject()
metadata?: {
  appleHealth?: Record<string, any>;
  googleFit?: Record<string, any>;
};
```

---

## 3. Heart Rate — Move to Top Level

`avgHeartRate` is already in the schema but never populated from HealthKit. With this change:
- `avgHeartRate` stays as a top-level field (usable regardless of source)
- `minHeartRate` + `maxHeartRate` go into `metadata.appleHealth`

This way anything that needs heart rate doesn't have to dig into metadata.

---

## 4. iOS HealthKit Module Changes

### `getWorkouts` — fetch metadata fields from HKWorkout

Extend the existing `map` block to read metadata keys and send a structured payload:

```swift
let meta = w.metadata ?? [:]

// Direct HKWorkout fields
let strokeCount    = w.totalSwimmingStrokeCount?.doubleValue(for: .count())
let lapEvents      = w.workoutEvents?.filter { $0.type == .lap }.count ?? 0
let flightsRaw     = w.totalFlightsClimbed?.doubleValue(for: .count())

// Metadata keys
let isIndoor       = meta[HKMetadataKeyIndoorWorkout] as? Bool
let avgMETs        = meta[HKMetadataKeyAverageMETs] as? Double
let elevUp         = (meta[HKMetadataKeyElevationAscended] as? HKQuantity)?.doubleValue(for: .meter())
let elevDown       = (meta[HKMetadataKeyElevationDescended] as? HKQuantity)?.doubleValue(for: .meter())
let avgSpeed       = (meta[HKMetadataKeyAverageSpeed] as? HKQuantity)?.doubleValue(for: HKUnit(from: "m/s"))
let maxSpeed       = (meta[HKMetadataKeyMaximumSpeed] as? HKQuantity)?.doubleValue(for: HKUnit(from: "m/s"))
let weatherCond    = (meta[HKMetadataKeyWeatherCondition] as? NSNumber).flatMap {
                       HKWeatherCondition(rawValue: $0.intValue)
                     }.map { weatherConditionString($0) }
let weatherTemp    = (meta[HKMetadataKeyWeatherTemperature] as? HKQuantity)?.doubleValue(for: .degreeCelsius())
let swimLocRaw     = meta[HKMetadataKeySwimmingLocationType] as? Int
let swimLoc        = swimLocRaw == 1 ? "pool" : swimLocRaw == 2 ? "openWater" : nil
let lapLength      = (meta[HKMetadataKeyLapLength] as? HKQuantity)?.doubleValue(for: .meter())

var appleMeta: [String: Any] = [:]
if let v = isIndoor    { appleMeta["isIndoor"] = v }
if let v = avgMETs     { appleMeta["avgMETs"] = v }
if let v = elevUp      { appleMeta["elevationAscendedMeters"] = v }
if let v = elevDown    { appleMeta["elevationDescendedMeters"] = v }
if let v = avgSpeed    { appleMeta["avgSpeedMps"] = v }
if let v = maxSpeed    { appleMeta["maxSpeedMps"] = v }
if let v = weatherCond { appleMeta["weatherCondition"] = v }
if let v = weatherTemp { appleMeta["weatherTempCelsius"] = v }
if let v = strokeCount { appleMeta["strokeCount"] = Int(v) }
if let v = swimLoc     { appleMeta["swimmingLocationType"] = v }
if let v = lapLength   { appleMeta["lapLength"] = v }
if lapEvents > 0       { appleMeta["laps"] = lapEvents }

return [
  "uuid":              w.uuid.uuidString,
  "type":              mapWorkoutType(w.workoutActivityType),
  "startTime":         iso.string(from: w.startDate),
  "endTime":           iso.string(from: w.endDate),
  "durationMs":        Int(w.duration * 1000),
  "calories":          Int(calories),
  "distanceMeters":    Int(distance),
  "sourceName":        w.sourceRevision.source.name,
  "metadata":          ["appleHealth": appleMeta],
]
```

### `mapWorkoutType` — expand to full type list

```swift
private func mapWorkoutType(_ type: HKWorkoutActivityType) -> String {
  switch type {
  case .running:                     return "running"
  case .walking:                     return "walking"
  case .cycling:                     return "cycling"
  case .swimming:                    return "swimming"
  case .hiking:                      return "hiking"
  case .elliptical:                  return "elliptical"
  case .rowing:                      return "rowing"
  case .stairClimbing:               return "stair_climbing"
  case .jumpRope:                    return "jump_rope"
  case .mixedCardio:                 return "mixed_cardio"
  case .yoga:                        return "yoga"
  case .pilates:                     return "pilates"
  case .barre:                       return "barre"
  case .flexibility:                 return "stretching"
  case .mindAndBody:                 return "meditation"
  case .traditionalStrengthTraining: return "strength_training"
  case .functionalStrengthTraining:  return "functional_training"
  case .highIntensityIntervalTraining: return "hiit"
  case .crossTraining:               return "cross_training"
  case .coreTraining:                return "core_training"
  case .tennis:                      return "tennis"
  case .badminton:                   return "badminton"
  case .squash:                      return "squash"
  case .tableTennis:                 return "table_tennis"
  case .soccer:                      return "soccer"
  case .basketball:                  return "basketball"
  case .volleyball:                  return "volleyball"
  case .boxing:                      return "boxing"
  case .martialArts:                 return "martial_arts"
  case .kickboxing:                  return "kickboxing"
  case .climbing:                    return "climbing"
  case .downhillSkiing:              return "skiing"
  case .crossCountrySkiing:          return "skiing"
  case .snowboarding:                return "snowboarding"
  case .surfingSports:               return "surfing"
  case .golf:                        return "golf"
  case .dance:                       return "dance"
  case .gymnastics:                  return "gymnastics"
  case .trackAndField:               return "track_and_field"
  case .cycling:                     return "cycling_indoor"  // covered above but indoor variant
  case .rugby:                       return "rugby"
  case .cricket:                     return "cricket"
  case .hockey:                      return "hockey"
  case .handball:                    return "handball"
  case .paddleSports:                return "paddling"
  case .wrestling:                   return "wrestling"
  default:                           return "other"
  }
}
```

### Heart rate — separate HKStatisticsQuery per workout (optional, opt-in)

Add a separate method `getWorkoutHeartRate(workoutUUID)` that fetches min/avg/max HR for a specific workout using `HKStatisticsQuery` with predicate `HKQuery.predicateForObjects(from: workout)`. Call this on-demand (e.g. when opening a workout detail) rather than for every workout in a bulk sync, since it requires one query per workout.

---

## 5. App-Side Sync Changes

In the workout sync service (wherever `getWorkouts` results are POSTed to the server):

```ts
// Map HealthKit result to CreateWorkoutDto
const payload = {
  name: deriveName(hkWorkout.type),   // e.g. "Morning Run" from type + time-of-day
  type: hkWorkout.type,
  startTime: hkWorkout.startTime,
  endTime: hkWorkout.endTime,
  duration: hkWorkout.durationMs,
  calories: hkWorkout.calories,
  source: 'apple_health',
  idempotencyKey: hkWorkout.uuid,
  metadata: hkWorkout.metadata,       // { appleHealth: { ... } }
};
```

---

## Files to Change

### Server (`health_partner`)
| File | Change |
|---|---|
| `workout/workout.schema.ts` | Expand type enum, add `metadata: Schema.Types.Mixed` |
| `workout/dto/create-workout.dto.ts` | Expand `@IsEnum`, add `metadata` field |
| `workout/dto/query-workout.dto.ts` | Add optional `type` filter |

### iOS app (`HealthPartner`)
| File | Change |
|---|---|
| `ios/HealthPartner/HealthKitModule.swift` | Expand `mapWorkoutType`, read metadata keys in `getWorkouts` |
| App workout sync service | Pass `metadata` field through to API |

`UpdateWorkoutDto` extends `PartialType(CreateWorkoutDto)` so it inherits all changes automatically — no changes needed there.

---

## Non-Goals

- GPS route storage
- Per-workout heart rate time series (bulk sync; fetch on-demand in detail view)
- Google Fit / Health Connect integration (placeholder in schema only)
