/*
This is the driver header file for DHT22 sensor with STM324FXX discovery board
Author: Bingjie Gao
*/
#include <stdarg.h>
#include <stdio.h>
#include <string.h>
#include <stdbool.h>

#include "stm32f4xx.h"

/*
definations
*/
#define OUTPUT			0
#define INPUT			1
#define NOPULL			0
#define PULLUP			1
#define PULLDOWN		2
#define LOW 			false
#define HIGH 			true


void dht_init(GPIO_TypeDef *GPIOx, uint16_t DHT22_Pin);
void pinMode(GPIO_TypeDef *GPIOx,uint16_t GPIO_PIN, int pinmode,int PuPd);
uint8_t DHT_read(uint8_t *data,GPIO_TypeDef *GPIOx,uint16_t DHT22_PIN);
uint8_t expectPulse(GPIO_TypeDef *GPIOx,uint16_t GPIO_PIN, bool pulse);
void GPIOx_TypeDefInitialize(GPIO_TypeDef *GPIOx);