#pragma once
#include <stdint.h>

typedef uint8_t u8;
typedef uint16_t u16;
typedef uint32_t u32;
typedef uint64_t u64;

typedef int8_t s8;
typedef int16_t s16;
typedef int32_t s32;
typedef int64_t s64;

typedef float f32;
typedef double f64;

enum {
	false, true
} typedef bool;

struct {
	f32 x, y;
} typedef v2;

#define KB(x) (x * 1024)
#define MB(x) (KB(x) * 1024)

#define len(arr) (sizeof(arr) / sizeof(arr[0]))

// TODO: Logging
// TODO: Assert statements
