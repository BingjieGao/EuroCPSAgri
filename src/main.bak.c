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




const uint16_t LEDS = GPIO_Pin_12 | GPIO_Pin_13 | GPIO_Pin_14 | GPIO_Pin_15;
const uint16_t LED[4] = {GPIO_Pin_12, GPIO_Pin_13, GPIO_Pin_14, GPIO_Pin_15};

uint8_t data[5];

#define LOW 		false
#define HIGH 		true

#define DHT22_GPIO	GPIOC
#define DHT22_PIN GPIO_Pin_3
#define UPDATE_INTERVAL (90*1000)

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

// uint8_t expectPulse(bool pulse){
// 	uint8_t count = 0;
// 	while(GPIO_ReadInputDataBit(DHT22_GPIO,DHT22_PIN) == pulse){
// 	    	if(count > 80)
// 	    		return 0;
// 	    	count++;
// 	    	delay_us(1L);
// 	     }

// 	return count;
// }

int main(void) {
	//setSysTick();
	timer_init();
	setup_Periph();
	float hum,tmp;
	int expect = 1;
	GPIO_InitTypeDef GPIO_DHT;
	print_fun("Hello World! %d %d %d %c\n",1,3,4,'A');

	RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOC, ENABLE);
    GPIO_DHT.GPIO_Pin = DHT22_PIN;
    GPIO_DHT.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_DHT.GPIO_Mode = GPIO_Mode_IN;
    GPIO_DHT.GPIO_PuPd = GPIO_PuPd_UP;
    GPIO_Init(DHT22_GPIO, &GPIO_DHT);


	while(1){
		// Nothing done here since we are using interrupts
		data[0] = data[1] = data[2] = data[3] = data[4] = 0;
		uint8_t cycles[80];
		delay_us(2000000);
		uint8_t dht_error,i;
		timer_start(UPDATE_INTERVAL*1000L);
		static uint32_t counter = 0;
		print_fun("start........\n");
		
	    // Clock Enable
	    

	    GPIO_SetBits(DHT22_GPIO, DHT22_PIN);
	    delay_us(250000L);


	    // configure pin
	    GPIO_DHT.GPIO_Pin = DHT22_PIN;
	    GPIO_DHT.GPIO_Speed = GPIO_Speed_50MHz;
	    GPIO_DHT.GPIO_Mode = GPIO_Mode_OUT;
	    GPIO_DHT.GPIO_OType = GPIO_OType_PP;
	    //GPIO_DHT.GPIO_PuPd = GPIO_PuPd_UP;
	    GPIO_Init(DHT22_GPIO, &GPIO_DHT);

	    GPIO_ResetBits(DHT22_GPIO, DHT22_PIN);
	    delay_us(20000L);

	    GPIO_SetBits(DHT22_GPIO, DHT22_PIN);
	    delay_us(40L);

	    //  switch to input
	    GPIO_DHT.GPIO_Pin = DHT22_PIN;
	    GPIO_DHT.GPIO_Speed = GPIO_Speed_50MHz;
	    GPIO_DHT.GPIO_Mode = GPIO_Mode_IN;
	    GPIO_DHT.GPIO_PuPd = GPIO_PuPd_UP;
	    GPIO_Init(DHT22_GPIO, &GPIO_DHT);


	    uint8_t expectlow = expectPulse(LOW);
	    uint8_t expecthigh = expectPulse(HIGH);
	    

	    for(i=0;i<80;i+=2){
	    	cycles[i] = expectPulse(LOW);
	    	cycles[i+1] = expectPulse(HIGH);
	    }

	    for(i=0;i<40;i++){
	    	uint8_t lowCycles  = cycles[2*i];
    		uint8_t highCycles = cycles[2*i+1];

    		if(lowCycles == 0 || highCycles == 0){
    			expect = -2;
    			break;
    		}

    		data[i/8] <<= 1;
    		if (highCycles > 50) {
			    // High cycles are greater than 50us low cycle count, must be a 1.
      			data[i/8] |= 1;
    		}

	    }

	    uint8_t checksum = data[0]+data[1]+data[2]+data[3];
	    if(checksum == data[4])
	    	print_fun("checksum is correct");
	    else
	    	print_fun("checksum is not correct");

		print_fun("low expect is %d\n",expectlow);
	    print_fun("high expect is %d\n",expecthigh);
	    print_fun("wrong expect is %d\n",expect);

	    for(i=0;i<40;i++){
	    	print_fun("cycles[%d] and cycles[%d] are %d, %d\n",i*2,i*2+1,cycles[i*2],cycles[i*2+1]);
	    }
	    for(i=0;i<5;i++){
	    	print_fun("data[%d] is %d\n",i,data[i]);
	    }
    	GPIO_ResetBits(GPIOD, LEDS);
    	GPIO_SetBits(GPIOD, LED[counter % 4]);
    	delay_us(3000000);
	}

	return 0;
}



