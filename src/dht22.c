/*
This is the driver file for DHT22 sensor with STM324FXX discovery board
Author: Bingjie Gao
*/
#include <stdarg.h>
#include <stdio.h>
#include <string.h>
#include <stdbool.h>

#include "stm32f4xx.h"
#include "dht22.h"
#include "timer.h"


GPIO_InitTypeDef GPIO_DHT;
/*Initialization DHT22*/
void dht_init(GPIO_TypeDef *GPIOx, uint16_t DHT22_PIN){
	
	/*Enable perpherals clock for GPIO ports*/
	//GPIO_DeInit(GPIOx);

	//RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOC, ENABLE);
	GPIOx_TypeDefInitialize(GPIOx);
	/***************************************************/
	
	/*Initialize DHT_Pin on GPIO ports*/
    GPIO_DHT.GPIO_Pin = DHT22_PIN;
    GPIO_DHT.GPIO_Speed = GPIO_Speed_25MHz;
    GPIO_DHT.GPIO_Mode = GPIO_Mode_IN;
    GPIO_DHT.GPIO_PuPd = GPIO_PuPd_UP;
    GPIO_Init(GPIOx, &GPIO_DHT);
    /***************************************************/
}

/*RCC perpherals clock initialize*/
void GPIOx_TypeDefInitialize(GPIO_TypeDef *GPIOx){
	if(GPIOx == GPIOA){
		RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOA, ENABLE);
	}
	else if(GPIOx == GPIOB){
		RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOB, ENABLE);
	}
	else if(GPIOx == GPIOC){
		RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOC, ENABLE);
	}
	else if(GPIOx == GPIOD){
		RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOD, ENABLE);
	}
	else if(GPIOx == GPIOE){
		RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOE, ENABLE);
	}
}
/*Setup the PinMode INPPUT/OUTPUT*/
void pinMode(GPIO_TypeDef *GPIOx,uint16_t GPIO_PIN, int pinmode,int PuPd){
	if(pinmode == 0){

		GPIO_DHT.GPIO_Pin = GPIO_PIN;
	    GPIO_DHT.GPIO_Speed = GPIO_Speed_25MHz;
	    GPIO_DHT.GPIO_Mode = GPIO_Mode_OUT;
	    GPIO_DHT.GPIO_OType = GPIO_OType_PP;
	    if(PuPd == 0)
	    	GPIO_DHT.GPIO_PuPd = GPIO_PuPd_NOPULL;
	    else if(PuPd == 1)
	    	GPIO_DHT.GPIO_PuPd = GPIO_PuPd_UP;
	    else if(PuPd == 2)
	    	GPIO_DHT.GPIO_PuPd = GPIO_PuPd_DOWN;
	}
	else if(pinmode ==1){
	    GPIO_DHT.GPIO_Pin = GPIO_PIN;
	    GPIO_DHT.GPIO_Speed = GPIO_Speed_50MHz;
	    GPIO_DHT.GPIO_Mode = GPIO_Mode_IN;

	   	if(PuPd == 0)
	    	GPIO_DHT.GPIO_PuPd = GPIO_PuPd_NOPULL;
	    else if(PuPd == 1)
	    	GPIO_DHT.GPIO_PuPd = GPIO_PuPd_UP;
	    else if(PuPd == 2)
	    	GPIO_DHT.GPIO_PuPd = GPIO_PuPd_DOWN;
	}
	GPIO_Init(GPIOx, &GPIO_DHT);
}
/*Read 80bits and form to 5 bytes data*/
uint8_t DHT_read(uint8_t *data,GPIO_TypeDef *GPIOx,uint16_t DHT22_PIN){
	uint8_t i,checksum;
	checksum = 0;
	GPIO_SetBits(GPIOx, DHT22_PIN);
    delay_us(250000L);

    // configure pin
    pinMode(GPIOx,DHT22_PIN,OUTPUT,0);

    GPIO_ResetBits(GPIOx, DHT22_PIN);
    delay_us(20000L);
    uint8_t cycles[80];

    GPIO_SetBits(GPIOx, DHT22_PIN);
    delay_us(30L);


    pinMode(GPIOx,DHT22_PIN,INPUT,1);
    //delay_us(10L);

    uint8_t expectlow = expectPulse(GPIOx,DHT22_PIN,LOW);
    uint8_t expecthigh = expectPulse(GPIOx,DHT22_PIN,HIGH);
    

    for(i=0;i<80;i+=2){
    	cycles[i] = expectPulse(GPIOx,DHT22_PIN,LOW);
    	cycles[i+1] = expectPulse(GPIOx,DHT22_PIN,HIGH);
    }

    for(i=0;i<40;i++){
    	uint8_t lowCycles  = cycles[2*i];
		uint8_t highCycles = cycles[2*i+1];

		if(lowCycles == 0 || highCycles == 0){
			return -2;
			break;
		}
		data[i/8] <<= 1;
		if (highCycles > 30) {
		    // High cycles are greater than 50us low cycle count, must be a 1.
  			data[i/8] |= 1;
		}
    }

    checksum = data[0]+data[1]+data[2]+data[3];
    if(checksum == data[4])
    	return 1;
    else
    	return -1;
}

/*Read bit from GPIO pin*/
uint8_t expectPulse(GPIO_TypeDef *GPIOx,uint16_t GPIO_PIN, bool pulse){
	uint8_t count = 0;
	while(GPIO_ReadInputDataBit(GPIOx,GPIO_PIN) == pulse){
	    	if(count > 80)
	    		return 0;
	    	count++;
	    	delay_us(1L);
	     }
	return count;
}








