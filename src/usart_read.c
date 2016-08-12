/*
USART3 TESTING
Wiring connections:
	STM32F4 			FTDI
	PB10 (USART3 Tx) ->	Rx
	PB11 (USART3 Rx) ->	Tx
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




const uint16_t LEDS = GPIO_Pin_12 | GPIO_Pin_13 | GPIO_Pin_14 | GPIO_Pin_15;
const uint16_t LED[4] = {GPIO_Pin_12, GPIO_Pin_13, GPIO_Pin_14, GPIO_Pin_15};

uint8_t data[5];
uint8_t data2[5];
uint8_t data3[5];
uint8_t data4[5];



#define DHT22_GPIO	GPIOC
#define DHT22_PIN 	GPIO_Pin_3
#define DHT22_PIN2 	GPIO_Pin_2
#define DHT22_PIN3	GPIO_Pin_5
#define DHT22_PIN4	GPIO_Pin_4

#define UPDATE_INTERVAL (90*1000)

#define MAX_STRLEN 3 // this is the maximum string length of our string in characters
volatile char received_string[MAX_STRLEN+1];




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

void LED_setup(void){
	RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOD, ENABLE);

    GPIO_InitTypeDef gpio;
    GPIO_StructInit(&gpio);
    gpio.GPIO_Mode = GPIO_Mode_OUT;
    gpio.GPIO_Pin = LEDS;
    GPIO_Init(GPIOD, &gpio);
}
void setup_Periph(void){
	GPIO_InitTypeDef GPIO_InitStructure;
	USART_InitTypeDef USART_InitStructure;
	NVIC_InitTypeDef NVIC_InitStructure;

	// Enable the APB1 periph clock for USART2
	RCC_APB1PeriphClockCmd(RCC_APB1Periph_USART3, ENABLE);
	// Enable the GPIOA clock, used by pins PA2, PA3
	RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOB, ENABLE);

	// Setup the GPIO pins for Tx and Rx
	GPIO_InitStructure.GPIO_Pin = GPIO_Pin_10 | GPIO_Pin_11;
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF;
	GPIO_InitStructure.GPIO_Speed = GPIO_Speed_25MHz;
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

	// Finally enable the USART3 peripheral
	USART_Cmd(USART3, ENABLE);
}

void USART3_IRQHandler(void){
	
	// check if the USART1 receive interrupt flag was set

	if( USART_GetITStatus(USART3, USART_IT_RXNE) ){

		
		static uint8_t cnt = 0; // this counter is used to determine the string length
		char t = USART3->DR; // the character from the USART1 data register is saved in t
		
		/* check if the received character is not the LF character (used to determine end of string) 
		 * or the if the maximum string length has been been reached 
		 */
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

void USART_puts(USART_TypeDef *USARTx, volatile char *str){
	while(*str){
		GPIO_SetBits(GPIOD,LED[1]);
		while(USART_GetFlagStatus(USARTx, USART_FLAG_TC) == RESET);
		USART_SendData(USARTx, *str);
		*str++;
	}
	GPIO_ResetBits(GPIOD,LED[1]);
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

int main(void) {
	//setSysTick();
	LED_setup();
	timer_init();
	setup_Periph();

	float hum,tmp;
	int expect = 1;
	GPIO_InitTypeDef GPIO_DHT;
	GPIO_SetBits(GPIOD,LED[2]);
	print_fun("Hello World! %d %d %d %c\n",1,3,4,'A');

	// dht_init(DHT22_GPIO, DHT22_PIN);
	// dht_init(DHT22_GPIO, DHT22_PIN2);
	// dht_init(DHT22_GPIO, DHT22_PIN3);


	while(1){
		print_fun("Hello World! %d %d %d %c\n",1,3,4,'A');
		delay_us(2000000);
		//print_fun("loop\n");
	}

	return 0;
}



