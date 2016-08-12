/*
Wiring connections:
	STM32F4 			CP2102
	PB10 (USART3 Tx) ->	Rx
	PB11 (USART3 Rx) ->	Tx
*/
#include <stdarg.h>
#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include "stm32f4xx.h"
#include "utility.h"

#define MAX_STRLEN 3 // this is the maximum string length of our string in characters
volatile char received_string[MAX_STRLEN+1];

const uint16_t LEDS = GPIO_Pin_12 | GPIO_Pin_13 | GPIO_Pin_14 | GPIO_Pin_15;
const uint16_t LED[4] = {GPIO_Pin_12, GPIO_Pin_13, GPIO_Pin_14, GPIO_Pin_15};


volatile uint32_t usTicks; /* counts 1us timeTicks       */
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

void setup_Periph(){
	GPIO_InitTypeDef GPIO_InitStructure;
	USART_InitTypeDef USART_InitStructure;
	NVIC_InitTypeDef NVIC_InitStructure;

	// Enable the APB1 periph clock for USART3
	RCC_APB1PeriphClockCmd(RCC_APB1Periph_USART3, ENABLE);
	// Enable the GPIOA clock, used by pins PA2, PA3
	RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOB, ENABLE);

	// Setup the GPIO pins for Tx and Rx
	GPIO_InitStructure.GPIO_Pin = GPIO_Pin_10 | GPIO_Pin_11;
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF;
	GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
	GPIO_InitStructure.GPIO_OType = GPIO_OType_PP;
	GPIO_InitStructure.GPIO_PuPd = GPIO_PuPd_UP;
	GPIO_Init(GPIOB, &GPIO_InitStructure);

	// Connect PA2 and PA3 with the USART2 Alternate Function
	GPIO_PinAFConfig(GPIOB, GPIO_PinSource10, GPIO_AF_USART3);
	GPIO_PinAFConfig(GPIOB, GPIO_PinSource11, GPIO_AF_USART3);

	USART_InitStructure.USART_BaudRate = 9600;
	USART_InitStructure.USART_WordLength = USART_WordLength_8b;
	USART_InitStructure.USART_StopBits = USART_StopBits_1;
	USART_InitStructure.USART_Parity = USART_Parity_No;
	USART_InitStructure.USART_HardwareFlowControl = USART_HardwareFlowControl_None;
	USART_InitStructure.USART_Mode = USART_Mode_Tx | USART_Mode_Rx;
	USART_Init(USART3, &USART_InitStructure);

	/* Enable the USART2 receive interrupt and configure
		the interrupt controller to jump to USART2_IRQHandler()
		if the USART2 receive interrupt occurs
	*/
	USART_ITConfig(USART3, USART_IT_RXNE, ENABLE);

	NVIC_InitStructure.NVIC_IRQChannel = USART3_IRQn;
	NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 0;
	NVIC_InitStructure.NVIC_IRQChannelSubPriority = 0;
	NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
	NVIC_Init(&NVIC_InitStructure);

	// Finally enable the USART2 peripheral
	USART_Cmd(USART3, ENABLE);
}

void USART_puts(USART_TypeDef *USARTx, volatile char *str){
	while(*str){
		// Wait for the TC (Transmission Complete) Flag to be set
		// while(!(USARTx->SR & 0x040));
		while(USART_GetFlagStatus(USARTx, USART_FLAG_TC) == RESET);
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
    USART_puts(USART3, textbuf);

    va_end( argp );
    return ret;
}

void loop(void){
	uint8_t i;
	while(1){
		uint8_t datum[165] = {0};
		readAll(datum);

		for(i=0;i<=132;i++){
			print_fun("datum[%d]=%d  \n",i,datum[i]);
		}
	delay_us(2000000);
	}
}
void test(uint8_t sensorID){
	uint8_t data[5];
	uint8_t ans,i;
	ans = readOne(sensorID,&data[0]);
	if(ans ==1){
		for(i=0;i<5;i++){
			print_fun("data[%d]=%d",i,data[i]);
		}
	}
	else
		print_fun("ans=%d",-1);
}
int main(void) {
	//setSysTick();
	timer_init();
	setup_Periph();
	float hum,tmp;
	int expect = 1;
	
	print_fun("Hello World! %d %d %d %c\n",1,3,4,'A');
	initAll();
	
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

		loop();
	}

	return 0;
}

void USART3_IRQHandler(void){
	
	// check if the USART1 receive interrupt flag was set

	if( USART_GetITStatus(USART3, USART_IT_RXNE) ){

		
		static uint8_t cnt = 0; // this counter is used to determine the string length
		char t = USART3->DR; // the character from the USART1 data register is saved in t
		
		/* check if the received character is not the LF character (used to determine end of string) 
		 * or the if the maximum string length has been been reached 
		 */
		if(t == 1){

		}
		if( (t != '\n') && (cnt < MAX_STRLEN) ){ 
			received_string[cnt] = t;
			cnt++;
		}
		else{ // otherwise reset the character counter and print the received string
			cnt = 0;
			USART_puts(USART3, received_string);
		}
		 
	}
	
}



