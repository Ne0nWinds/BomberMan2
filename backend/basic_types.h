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

enum {
	false, true
} typedef bool;

#define KB(x) (x * 1024)
#define MB(x) (KB(x) * 1024)

// TODO: Logging
// TODO: Assert statements
