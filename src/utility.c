/*
This is the source file contains two main utility functions.
In order to respond two cmds from hub
*/

#include "utility.h"
#include "stm32f4xx.h"
#include "inttypes.h"
#include "stm32f4xx_exti.h"
#include "dht22.h"
#include <stdint.h>

#define CRC16 0x8005
#define POLY 0x1021


/******************************************************************************
DHT port definitation**********************************************************
*******************************************************************************/
uint16_t DHT22_PIN[32] = {
						/*GPIOC*/
						GPIO_Pin_1,GPIO_Pin_0,GPIO_Pin_3,GPIO_Pin_2,
						/*GPIOA*/
						GPIO_Pin_1,GPIO_Pin_0,GPIO_Pin_2,GPIO_Pin_3,
						GPIO_Pin_5,GPIO_Pin_4,GPIO_Pin_6,GPIO_Pin_7,
						/*GPIOC*/
						GPIO_Pin_5,GPIO_Pin_4,
						/*GPIOB*/
						GPIO_Pin_0,GPIO_Pin_1,
						/*GPIOD*/
						GPIO_Pin_14,GPIO_Pin_11,
						/*GPIOE*/
						GPIO_Pin_8,GPIO_Pin_7,GPIO_Pin_9,GPIO_Pin_10,
						GPIO_Pin_12,GPIO_Pin_11,GPIO_Pin_13,GPIO_Pin_14,
						/*GPIOB*/
						GPIO_Pin_14,GPIO_Pin_13,
						/*GPIOD*/
						GPIO_Pin_8,
						/*GPIOB*/
						GPIO_Pin_15,
						/*GPIOD*/
						GPIO_Pin_10,GPIO_Pin_9
						};

GPIO_TypeDef* DHT_PORT[10] = {GPIOC,GPIOA,GPIOC,GPIOB,GPIOD,GPIOE,GPIOB,GPIOD,GPIOB,GPIOD};
/****************************************************************************/

/*
Initialize all data pins
*/
void initAll(void){
	uint8_t index;
	for(index=1;index<34;index++){
		initOne(index);
	}
}
/*
read all available sensors
*/
void readAll(uint8_t datum[]){
	uint8_t index;
	for(index=1;index<33;index++){
		readOne(index,&datum[(index-1)*5]);
	}
}

/*
read specific sensor No.1-33 for testing
*/
uint8_t readOne(uint8_t sensorID/*1-33*/,uint8_t *data){
	SENSOR_PIN sensor_pin;
	uint8_t ans;
	getSensorPin(&sensor_pin,sensorID);
	ans = DHT_read(data,sensor_pin.DHT_PORT,sensor_pin.DHT22_PIN);
	return ans;
}

uint8_t initOne(uint8_t sensorID/*1-33*/){
	SENSOR_PIN sensor_pin;
	getSensorPin(&sensor_pin,sensorID);
	dht_init(sensor_pin.DHT_PORT,sensor_pin.DHT22_PIN);
	return 0;
}

void getSensorPin(SENSOR_PIN *sensor_pin,uint8_t sensorID){
	sensor_pin->DHT22_PIN = DHT22_PIN[sensorID-1];
	if(sensorID<5){
		/*GPIOC*/
		sensor_pin->DHT_PORT = DHT_PORT[0];
	}
	else if(sensorID>4 && sensorID<13){
		/*GPIOA*/
		sensor_pin->DHT_PORT = DHT_PORT[1];
	}
	else if(sensorID>12 && sensorID<15){
		/*GPIOC*/
		sensor_pin->DHT_PORT = DHT_PORT[2];
	}
	else if(sensorID>14 && sensorID<17){
		/*GPIOB*/
		sensor_pin->DHT_PORT = DHT_PORT[3];
	}
	else if(sensorID>16 && sensorID<19){
		/*GPIOD*/
		sensor_pin->DHT_PORT = DHT_PORT[4];
	}

	else if(sensorID>18 && sensorID<27){
		/*GPIOE*/
		sensor_pin->DHT_PORT = DHT_PORT[5];
	}
	else if(sensorID>26 && sensorID<29){
		/**GPIOB*/
		sensor_pin->DHT_PORT = DHT_PORT[6];
	}
	else if(sensorID>28 && sensorID<30){
		/*GPIOD*/
		sensor_pin->DHT_PORT = DHT_PORT[7];
	}
	else if(sensorID>29 && sensorID<31){
		/*GPIOB*/
		sensor_pin->DHT_PORT = DHT_PORT[8];
	}
	else if(sensorID>30 && sensorID<33){
		/*GPIOD*/
		sensor_pin->DHT_PORT = DHT_PORT[9];
	}
}

/*
Generate CRC16 checksum
*/
uint16_t gen_crc16(const uint8_t *data_p, uint16_t length)
{
	uint8_t i;
    unsigned int data;
    uint16_t crc = 0xffff;

      if (length == 0)
            return (~crc);

      do
      {
            for (i=0, data=(unsigned int)0xff & *data_p++;
                 i < 8; 
                 i++, data >>= 1)
            {
                  if ((crc & 0x0001) ^ (data & 0x0001))
                        crc = (crc >> 1) ^ POLY;
                  else  crc >>= 1;
            }
      } while (--length);

      crc = ~crc;
      data = crc;
      crc = (crc << 8) | (data >> 8 & 0xff);

      return (crc);
}






