
#pragma once

#include <stdarg.h>
#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include "stm32f4xx.h"
#include "inttypes.h"
#include "stm32f4xx_exti.h"
#include "timer.h"
#include "dht22.h"

#define UPDATE_INTERVAL (90*1000)

uint8_t data[5];
uint8_t data2[5];
uint8_t data3[5];
uint8_t data4[5];

typedef struct SENSOR_PIN{
	uint16_t DHT22_PIN;
	GPIO_TypeDef *DHT_PORT;
}SENSOR_PIN;

uint8_t readOne(uint8_t sensorID/*1-33*/,uint8_t *data);
void getSensorPin(SENSOR_PIN *sensor_pin,uint8_t sensorID);
void readAll(uint8_t *datum);
void initAll(void);
uint8_t initOne(uint8_t sensorID/*1-33*/);
uint16_t gen_crc16(const uint8_t *data, uint16_t size);
/**/






















