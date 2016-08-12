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
#include "crc16.h"
#include "inttypes.h"
#include "crc16.h"

#define MAX_STRLEN 5 // this is the maximum string length of our string in characters
volatile char received_string[MAX_STRLEN+6];

const uint16_t LEDS = GPIO_Pin_14 | GPIO_Pin_15;
const uint16_t LED[2] = {GPIO_Pin_14, GPIO_Pin_15};

uint8_t CMD,testID;


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
void LED_setup(void){
	RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOC, ENABLE);

    GPIO_InitTypeDef LEDgpio;
    GPIO_StructInit(&LEDgpio);
    LEDgpio.GPIO_Mode = GPIO_Mode_OUT;
    LEDgpio.GPIO_Pin = LEDS;
    GPIO_Init(GPIOC, &LEDgpio);
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
	GPIO_SetBits(GPIOC,GPIO_Pin_15);
	while(*str){
		// Wait for the TC (Transmission Complete) Flag to be set
		// while(!(USARTx->SR & 0x040));
		while(USART_GetFlagStatus(USARTx, USART_FLAG_TC) == RESET);
		USART_SendData(USARTx, *str);
		
		*str++;
	}
	GPIO_ResetBits(GPIOC,GPIO_Pin_15);
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
void loop_fun(void){
	uint8_t i;
	uint32_t crc32;
	uint16_t crc16;

	delay_us(2500000);
	uint8_t datum[165] = {0};
	/*
	* Test Run
	*/
	// for(i=0;i<165;i++){
	// 	datum[i] = i;
	// }
	readAll(datum);
	crc16 = crc16_ccitt(datum, 165);
	/*
	read all the sensors data
	*/
	
	
	delay_us(2000);
	print_fun("%04x",0xAA55);
	print_fun(",");
	for(i=0;i<165;i++){
		print_fun("%d",datum[i]);
		print_fun(",");
	} 
	print_fun("%d",i);
	print_fun(",");
	print_fun("%04x",crc16);
	print_fun(",");
	print_fun("%04x",0xAA55);
	print_fun("\n\r");
	delay_us(2000000);
	//stop_fun();
}
void stop_fun(void){
	while(CMD <0);
}
void test(uint8_t sensorID){
	uint8_t data[5];
	uint8_t ans,i;
	uint16_t crc16;
	delay_us(4000000);
	ans = readOne(sensorID,&data[0]);
	// for(i=0;i<5;i++){
	// 	data[i] = i;
	// }
	crc16 = crc16_ccitt(data,5);
	print_fun("%04x",0xAA55);
	print_fun(",");
	print_fun("%d",sensorID);
	print_fun(",");
	if(ans ==1){
		for(i=0;i<5;i++){
			print_fun("%d",data[i]);
			print_fun(",");
		}
		print_fun("%d",i);
		print_fun(",");
		print_fun("%04x",crc16);
		print_fun(",");
	//}
	else{
		print_fun("%04x",0xFFFF);
		print_fun(",");
	}
	print_fun("%04x",0xAA55);
	print_fun("\n\r");
}
int main(void) {
	timer_init();
	LED_setup();
	setup_Periph();
	float hum,tmp;
	int expect = 1;
	
	print_fun("Hello World! %d %d %d %c\n\r",1,3,4,'A');

	initAll();
	
	while(1){
		//loop_fun();
		//print_fun("start.....\n");
		printf("cmd is now %d\n",CMD);
		delay_us(200000);
		if(CMD == 1){
			loop_fun();
		}
		if(CMD == 2){
			test(testID);
		}
		if(CMD == -1){

		}
	}

	return 0;
}

void USART3_IRQHandler(void){
	
	// check if the USART1 receive interrupt flag was set

	if( USART_GetITStatus(USART3, USART_IT_RXNE) ){
		GPIO_SetBits(GPIOC,GPIO_Pin_14);
		
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
			//USART_puts(USART3, received_string);
			if(received_string[0] == '1'){
				CMD = 1;
				//print_fun("cmd is %d\n",CMD);
				
			}
			else if(received_string[0] == '2' && received_string[1] == '+'){
				testID=0;
				CMD = 2;
				//testID = received_string[2];
				//print_fun("[2]=%d,[3]=%d\n",received_string[2],received_string[3]);
				testID = (int)(received_string[2]-48) * 10 + (int)(received_string[3]-48);
				//print_fun("testid id %d\n",testID);
			}
			else if(received_string[0] == '3'){
				CMD = -1;
			}
		}
		 
	}
	GPIO_ResetBits(GPIOC,GPIO_Pin_14);
}



