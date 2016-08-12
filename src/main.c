/*
USART2 example, with IRQ

I am using a CP2102 USB-to-USART converter.
Wiring connections:
	STM32F4 			CP2102
	PA2 (USART2 Tx) ->	Rx
	PA3 (USART2 Rx) ->	Tx
*/
#include <stdarg.h>
#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include "stm32f4xx.h"
#include "inttypes.h"
#include "stm32f4xx_exti.h"
#include "timer.h"
#include "dht22.h"





// const uint16_t LEDS = GPIO_Pin_12 | GPIO_Pin_13 | GPIO_Pin_14 | GPIO_Pin_15;
// const uint16_t LED[4] = {GPIO_Pin_12, GPIO_Pin_13, GPIO_Pin_14, GPIO_Pin_15};

// uint8_t data[5];
// uint8_t data2[5];
// uint8_t data3[5];
// uint8_t data4[5];



// #define DHT22_GPIO	GPIOC
// #define DHT22_PIN 	GPIO_Pin_3
// #define DHT22_PIN2 	GPIO_Pin_2
// #define DHT22_PIN3	GPIO_Pin_5
// #define DHT22_PIN4	GPIO_Pin_4

// #define UPDATE_INTERVAL (90*1000)

/* Globals */
static uint8_t dht_bytes[5];


volatile uint32_t usTicks; /* counts 1ms timeTicks       */
void SysTick_Handler(void) {
	timer_decrement();
}

//  Delays number of Systicks (happens every 1 ms)
void Delay(__IO uint32_t dlyTicks){                                              
  uint32_t curTicks = usTicks;
  while ((usTicks - curTicks) < dlyTicks);
}

void setSysTick(){
	// ---------- SysTick timer (1ms) -------- //
	if (SysTick_Config(SystemCoreClock / 1000000)) {
		// Capture error
		while (1){};
	}
}

void LED_setup(){
	RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOD, ENABLE);

    GPIO_InitTypeDef gpio;
    GPIO_StructInit(&gpio);
    gpio.GPIO_Mode = GPIO_Mode_OUT;
    gpio.GPIO_Pin = LEDS;
    GPIO_Init(GPIOD, &gpio);
}
void setup_Periph(){
	GPIO_InitTypeDef GPIO_InitStructure;
	USART_InitTypeDef USART_InitStructure;
	NVIC_InitTypeDef NVIC_InitStructure;

	// Enable the APB1 periph clock for USART2
	RCC_APB1PeriphClockCmd(RCC_APB1Periph_USART2, ENABLE);
	// Enable the GPIOA clock, used by pins PA2, PA3
	RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOA, ENABLE);

	// Setup the GPIO pins for Tx and Rx
	GPIO_InitStructure.GPIO_Pin = GPIO_Pin_2 | GPIO_Pin_3;
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF;
	GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
	GPIO_InitStructure.GPIO_OType = GPIO_OType_PP;
	GPIO_InitStructure.GPIO_PuPd = GPIO_PuPd_UP;
	GPIO_Init(GPIOA, &GPIO_InitStructure);

	// Connect PA2 and PA3 with the USART2 Alternate Function
	GPIO_PinAFConfig(GPIOA, GPIO_PinSource2, GPIO_AF_USART2);
	GPIO_PinAFConfig(GPIOA, GPIO_PinSource3, GPIO_AF_USART2);

	USART_InitStructure.USART_BaudRate = 115200;
	USART_InitStructure.USART_WordLength = USART_WordLength_8b;
	USART_InitStructure.USART_StopBits = USART_StopBits_1;
	USART_InitStructure.USART_Parity = USART_Parity_No;
	USART_InitStructure.USART_HardwareFlowControl = USART_HardwareFlowControl_None;
	USART_InitStructure.USART_Mode = USART_Mode_Tx | USART_Mode_Rx;
	USART_Init(USART2, &USART_InitStructure);

	/* Enable the USART2 receive interrupt and configure
		the interrupt controller to jump to USART2_IRQHandler()
		if the USART2 receive interrupt occurs
	*/
	USART_ITConfig(USART2, USART_IT_RXNE, ENABLE);

	NVIC_InitStructure.NVIC_IRQChannel = USART2_IRQn;
	NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 0;
	NVIC_InitStructure.NVIC_IRQChannelSubPriority = 0;
	NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
	NVIC_Init(&NVIC_InitStructure);

	// Finally enable the USART2 peripheral
	USART_Cmd(USART2, ENABLE);
}

void USART_puts(USART_TypeDef *USARTx, volatile char *str){
	while(*str){
		// Wait for the TC (Transmission Complete) Flag to be set
		// while(!(USARTx->SR & 0x040));
		while(USART_GetFlagStatus(USART2, USART_FLAG_TC) == RESET);
		USART_SendData(USARTx, *str);
		*str++;
	}
}
int print_fun(const char *fmt, ...)
{
    int ret;
    char textbuf[255];
    va_list argp;

    va_start( argp, fmt );

    ret = vsprintf( textbuf, fmt, argp );
    USART_puts(USART2, textbuf);

    va_end( argp );
    return ret;
}

int main(void) {
	//setSysTick();
	timer_init();
	setup_Periph();
	float hum,tmp;
	int expect = 1;
	GPIO_InitTypeDef GPIO_DHT;
	print_fun("Hello World! %d %d %d %c\n",1,3,4,'A');

	dht_init(DHT22_GPIO, DHT22_PIN);
	dht_init(DHT22_GPIO, DHT22_PIN2);
	dht_init(DHT22_GPIO, DHT22_PIN3);


	while(1){
		// Nothing done here since we are using interrupts
		data[0] = data[1] = data[2] = data[3] = data[4] = 0;
		data2[0] = data2[1] = data2[2] = data2[3] = data2[4] = 0;
		data3[0] = data3[1] = data3[2] = data3[3] = data3[4] = 0;
		data4[0] = data4[1] = data4[2] = data4[3] = data4[4] = 0;
		//uint8_t cycles[80];
		delay_us(2000000);
		uint8_t dht_error,i;
		timer_start(UPDATE_INTERVAL*1000L);
		static uint32_t counter = 0;
		print_fun("start........\n");

		uint8_t read = DHT_read(&data,DHT22_GPIO,DHT22_PIN);	
		uint8_t read2 = DHT_read(&data2,DHT22_GPIO,DHT22_PIN2);
		uint8_t read3 = DHT_read(&data3,DHT22_GPIO,DHT22_PIN3);
		uint8_t read4 = DHT_read(&data4,DHT22_GPIO,DHT22_PIN4);
		
	    for(i=0;i<5;i++){
	    	print_fun("data[%d] is %d   ",i,data[i]);
	    	print_fun("data2[%d] is %d  ",i,data2[i]);
	    	print_fun("data3[%d] is %d  ",i,data3[i]);
	    	print_fun("data4[%d] is %d  \n",i,data3[i]);
	    }
	    print_fun("checksum are %d and %d and %d \n",read,read2,read3);
    	 //delay_us(1000000);
	}

	return 0;
}



