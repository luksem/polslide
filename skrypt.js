/*********************************************************************************
******	polSlide 1.0 - slider napisany w Vanilla JS	by lukas				******
******	luksem.pl 															******
******	polSlide(slider, slideTime, effect, sliderPaginationm sliderNav);	******
**********************************************************************************
		*slider - lista ul
		*slideTime - opóźnienie zmiany elementu
		*effect (fade/slide/null) - efekt z jakim zmieniają się elementy
		*sliderPagination(true/false) - paginacja slidera (menu kropki)
			#id = pagination;
		*sliderNav(true/false) - nawigacja slidera (strzałki)
			id - 	#slider_nav;
			class - previous = .previous_slide / next = .next_slide;
**********************************************************************************
**********************************************************************************/
		
function polSlide(slider, slideTime, effect, sliderPagination, sliderNav) {
			
			//Date.now() polyfill
			//funkcja działa ponoć 2x szybciej od date().getTime(); 
			//http://jsperf.com/new-date-vs-date-now-vs-performance-now/6
			if (!Date.now) {
				Date.now = function now() {
					return new Date().getTime();
				};
			}
			
			// requestAnimationFrame polyfill by Erik Möller
			// fixes from Paul Irish and Tino Zijdel
			(function() {
				var lastTime = 0;
				var vendors = ['ms', 'moz', 'webkit', 'o'];
				for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
					window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
					window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
											   || window[vendors[x]+'CancelRequestAnimationFrame'];
				}
			 
				if (!window.requestAnimationFrame)
					window.requestAnimationFrame = function(callback, element) {
						var currTime = Date.now();
						var timeToCall = Math.max(0, 16 - (currTime - lastTime));
						var id = window.setTimeout(function() { callback(currTime + timeToCall); },
						  timeToCall);
						lastTime = currTime + timeToCall;
						return id;
					};
			 
				if (!window.cancelAnimationFrame)
					window.cancelAnimationFrame = function(id) {
						clearTimeout(id);
					};
			}()); //rAf polyfill END
			
// POLSLIDE - Początek właściwy funkcji			
			
			//Menu slidera domyślnie wyłączone (paginacja i strzałki)
			sliderPagination = sliderPagination || false;
			sliderNav = sliderNav || false;
			
			//Pobieram elementy listy slidera
			var sliderElements = slider.getElementsByTagName('li');
			
			//Ustawiam domyślne stylowanie elementów
			if (effect == null || effect == 'fade') {
				for (var i=0; i<sliderElements.length; i++) {
					sliderElements[i].style.position = 'absolute';
					sliderElements[i].style.left = 0;
					sliderElements[i].style.top = 0;
					sliderElements[i].style.zIndex = 1;
				}
			}
			   
/**************** FUNKCJE EFEKTÓW START *******************************/			
				//Definiuje zmienną ze statusem animacji (czy animacja jest w trakcie)
				//Dzięki temu mogę zablokować zmianę pozycji w menu gdy animacja trwa
				var animationProgress = false;
				
				//ANIAMTE() - funkcja rysujaca na podstawie różnicy czasu miedzy klatkami (requestAnimationFrame() + delta time)
				//jako parametr przyjmuje funkcję anonimową, zmieniające ustawienia danego elementu do momentu, w którym animacja ma się zakończyć
				function animate(rendering) {
					var running;
					var currentFrame, deltaTime, lastFrame = Date.now();
				
					(function loop() {
						currentFrame = Date.now();
						deltaTime = currentFrame - lastFrame;
							if (running !== false) { 	//undefined == true
								requestAnimationFrame(loop);
								running = rendering(deltaTime);
							}
						lastFrame = currentFrame;
					})();
				}		
	
	/////////// FADE() /////////////				
				function fade(elem) {	
					animationProgress = true; //ustawiam status animacji aby zablokowac zdarzenia menu			
					elem.style.opacity = 1;
				
					animate(function(deltaTime) {
						if((elem.style.opacity > 0) && ((elem.style.opacity - deltaTime/1000) >=0)) {
							elem.style.opacity -= deltaTime/1000; 	
								// for IE
							elem.style.filter = 'alpha(opacity=' + elem.style.opacity * 100 + ')';	
							return true;
						} else {
							elem.style.opacity = 1;	
							elem.style.display = 'block';
							elem.style.zIndex = 1;
								
							animationProgress = false; //z powrotem aktywuje zdarzenia menu, gdy animacja zakończy sięs
							return false;
						}
					});
				}
				
	/////////// SLIDE() /////////////
				function slide(fromElem, toElem, direction) {
					animationProgress = true; //ustawiam status animacji aby zablokowac zdarzenia menu					
					
					var positionMove;
					var direction = direction || 'left'; //domyslny kierunek przesuwania elementu w lewo
					var elements = fromElem.parentNode.getElementsByTagName('li');	//pobieram cala kolekcje na nowo wzgledem przekazanego elementu
					var elementWidth = parseInt(getComputedStyle(fromElem).width);	//ustalam szerokosc elementu
			
					//Przygotowanie do efektu slide, pierwszy element na scenie, reszta o elementWidth na prawo za scene
					if(!fromElem.style.position) {
						for (var i=0; i<elements.length; i++) {
							elements[i].style.position = 'absolute';
							elements[i].style.top = 0;
							elements[i].style.left = ( i>0 ) ? (elementWidth)+'px' : '0px';
						}
					}	
					
					animate(function(deltaTime) { 
						positionMove = Math.floor(10*(deltaTime/16)); 
										
						if(direction == 'left') {
							if((parseInt(fromElem.style.left) - positionMove) >=  -(elementWidth)) { //czy po biegu petli, element nadal bedzie na ekranie
								fromElem.style.left = parseInt(fromElem.style.left) - positionMove + 'px';
								toElem.style.left = parseInt(toElem.style.left) - positionMove + 'px';
								return true;
							} else { //jesli nie to ustaw go na scene a poprzedni wrzuc w stos z innymi , przerwij funkcje
								fromElem.style.left = elementWidth + 'px';
								toElem.style.left = 0;
								animationProgress = false; //z powrotem aktywuje zdarzenia menu
								return false;
							}  
						} else { //kierunek przesuwania w prawo, gdy sie cofam
							if((parseInt(fromElem.style.left) + positionMove) <=  elementWidth) {
								fromElem.style.left = parseInt(fromElem.style.left) + positionMove + 'px';
								toElem.style.left = parseInt(toElem.style.left) + positionMove + 'px';
								return true;
							} else {
								fromElem.style.left = elementWidth + 'px';
								toElem.style.left = 0;
								animationProgress = false; //z powrotem aktywuje zdarzenia menu
								return false;
							}  
						}	
					});		
				}
/**************** FUNKCJE EFEKTÓW END *********************************/	

/****************MENU SLIDERA START*******************************/	
	
	//tworze i dodaje kod html menu(strzałki) do slidera, jeżeli w funkcji polSlide() argument sliderNav == true
	if(sliderNav == true) {
		if (!document.getElementById('slider_nav'))	{
			var sliderNavigation = document.createElement('div');
			sliderNavigation.id = 'slider_nav';
			sliderNavigation.innerHTML = '<button class="previous_slide">poprzedni slajd</button><button class="next_slide">następny slajd</button>'		
			slider.parentNode.appendChild(sliderNavigation);	
		}		
	}
	
	//tworze i dodaje kod html paginacji do slidera, jezeli w funkcji polSlide() argument sliderPagination == true
	//http://jsperf.com/innerhtml-vs-createelement-test/6 
			if(sliderPagination == true) {
				if (!document.getElementById('pagination')) {
					var menu = document.createElement('div');
					menu.id = 'pagination';
					var button;
					
					for (var i=0; i<sliderElements.length; i++) {
						button = document.createElement('button');
						button.appendChild(document.createTextNode(i));
						menu.appendChild(button);
					}
				
					slider.parentNode.appendChild(menu);			
				} 
			}

/****************MENU SLIDERA END*********************************/	
													
//PETLA SLIDERA
			(function loop(x) {
			
				var x = x || 0;	//USTAWIAM DOMYSLNA WARTOSC DLA PETLI
	
				//Ustawiam style dla pierwszych elementów po wyzerowaniu pętli			
				if (x == 0) {
						if( effect == 'fade' ) {
							sliderElements[0].style.zIndex = '2'; 
							sliderElements[0].style.opacity = '1';
							sliderElements[0].style.display = 'block';
							// for IE
								sliderElements[0].style.filter = 'alpha(opacity=' + 100 + ')';
						} else if (effect != 'slide') {
							sliderElements[0].style.zIndex = 2; 
						}
				}
				
				//Definiuję funkcję setTimeout odpowiedzialną za automatyczny play slidera
				var timeoutId = setTimeout(
						function() {					
//WARUNEK PRAWDZIWY JEZELI JEST TO PIERWSZY BIEG PETLI
							if (x==0) {
		//ZMIENIAM STYLE ELEMENTU KORZYSTAJAC Z DANEGO EFEKTU							
								if (effect == 'fade') { 
									sliderElements[x].nextElementSibling.style.display = 'block';
									sliderElements[x].nextElementSibling.style.opacity = 1;
									// for IE
										sliderElements[x].nextElementSibling.style.filter = 'alpha(opacity=' + 100 + ')';
									sliderElements[x].nextElementSibling.style.zIndex= 2;
									
									sliderElements[x].style.zIndex = 3; 
									fade(sliderElements[x]);			
								} 
								else if (effect == 'slide') {
									slide(sliderElements[x], sliderElements[x+1]);
								} 
								else {
									sliderElements[x].style.zIndex = 1; 
									sliderElements[x].nextElementSibling.style.zIndex= 2;
									if (sliderElements.length > 2) sliderElements[(sliderElements.length)-1].style.zIndex= 1;
								}
		
		//ZMIENIAM LICZNIK I URUCHAMIAM PETLE
								x++;
								return loop(x);
							}
							
							
//WARUNEK PRAWDZIWY JEZELI BIEG PETLI JEST WIEKSZY OD 1
							if ((x>0) && (x<(sliderElements.length-1))) {
		//ZMIENIAM STYLE ELEMENTU KORZYSTAJAC Z DANEGO EFEKTU							
								if(effect == 'fade') {
									sliderElements[x].nextElementSibling.style.display = 'block';
									sliderElements[x].previousElementSibling.style.zIndex=1;
									sliderElements[x].nextElementSibling.style.opacity = 1;
									// for IE
										sliderElements[x].nextElementSibling.style.filter = 'alpha(opacity=' + 100 + ')';
									sliderElements[x].nextElementSibling.style.zIndex = 2;
										
									sliderElements[x].style.zIndex = 3; 
									fade(sliderElements[x]);
								} 
								else if (effect == 'slide') {
									slide(sliderElements[x], sliderElements[x+1]);
								} 
								else {
									sliderElements[x].style.zIndex = 1; 
									sliderElements[x].nextElementSibling.style.zIndex= 2;
								}
		//ZMIENIAM LICZNIK I URUCHAMIAM PETLE
								x++;
								return loop(x);
							}
							
							
//WARUNEK PRAWDZIWY GDY AKTYWNY ELEMENT JEST OSTATNIM ELEMENTEM
							if (x == (sliderElements.length-1)) {
		//ZMIENIAM STYLE ELEMENTU KORZYSTAJAC Z DANEGO EFEKTU							
								if(effect == 'fade') {
									sliderElements[x].style.zIndex = 3;
									fade(sliderElements[x]); 
									
									sliderElements[x].previousElementSibling.style.zIndex=1; 
								} 
								else if (effect == 'slide') {
									slide(sliderElements[x], sliderElements[0]);
								} 
								else {
									sliderElements[x].style.zIndex = 1; 
								}
								
		//ZMIENIAM LICZNIK I URUCHAMIAM PETLE
								return loop(0); //zeruje petle
							}						
							
						}
					,slideTime)	//KONIEC setTimeout()
			
			
	/*****************AKTUALIZACJA EVENTOW DLA MENU SLIDERA START***********************/		
			if(sliderNav == true) {
				var sliderNavigation = document.getElementById('slider_nav');
					sliderNavigation.onclick = function(eventProperties) {
						eventProperties = eventProperties || window.event;	//4IE
						var target = eventProperties.target || eventProperties.srcElement; //4IE
						if (target.nodeName.toLowerCase() == 'button') {
							var newPosition = (target.className == 'previous_slide') ? x-1 : x+1;
								if (newPosition < 0) {
									newPosition = sliderElements.length-1;
								} else if (newPosition > sliderElements.length-1) {
									newPosition = 0;
								}
							
							if (animationProgress == false) { //blokada zdarzenia dla aktywnego elementu i gdy trwa animacja
								clearTimeout(timeoutId);
					
								if (!effect) {
									sliderElements[x].style.zIndex = 1;	
									sliderElements[newPosition].style.zIndex = 2;
								}			
								else if (effect == 'fade') {
									sliderElements[x].style.zIndex = 3;
									fade(sliderElements[x])
						
									sliderElements[newPosition].style.display = 'block';
									sliderElements[newPosition].style.zIndex = 2;
									sliderElements[newPosition].style.opacity = 1;	
										//for IE
										sliderElements[newPosition].style.filter = 'alpha(opacity=100)';
								}				
								else if (effect == 'slide') {
									var sliderWidth = getComputedStyle(sliderElements[newPosition]).width; //pobieram szerokosc elementow do ich ukrywania
									if(newPosition > x) {
										sliderElements[newPosition].style.left = sliderWidth; //przesuwam w lewo zgodnie z petla
										slide(sliderElements[x], sliderElements[newPosition]);
									} else {
										sliderElements[newPosition].style.left = '-'+sliderWidth; //wrzucam przed aktywny element
										slide(sliderElements[x], sliderElements[newPosition], 'right'); //przesuwam je w prawo, jeden trafia na scene a drugi do stosu
									}
								}
					
							loop(newPosition); //odpalam petle w miejscu aktywowanego elementu
							}
						}
					}
			}
			
			if(sliderPagination == true) {			
				//Pobieram menu aby przypisac zdarzenie odpalane przez event delegation do button
				var menu = document.getElementById('pagination');		
				
					menu.onclick = function(eventProperties) {
						eventProperties = eventProperties || window.event;	//4IE
						var target = eventProperties.target || eventProperties.srcElement; //4IE
						
						if (target.nodeName.toLowerCase() == 'button') {	
							var i = [].indexOf.call(target.parentNode.children,target); //ustalam index kliknietego buttona
							
							if ((i != x) && (animationProgress == false)) { //blokada zdarzenia dla aktywnego elementu i gdy trwa animacja
								clearTimeout(timeoutId);
					
								if (!effect) {
									sliderElements[x].style.zIndex = 1;	
									sliderElements[i].style.zIndex = 2;
								}			
								else if (effect == 'fade') {
									sliderElements[x].style.zIndex = 3;
									fade(sliderElements[x])
						
									sliderElements[i].style.display = 'block';
									sliderElements[i].style.zIndex = 2;
									sliderElements[i].style.opacity = 1;	
										//for IE
										sliderElements[i].style.filter = 'alpha(opacity=100)';
								}				
								else if (effect == 'slide') {
									var sliderWidth = getComputedStyle(sliderElements[i]).width; //pobieram szerokosc elementow do ich ukrywania
									if(i > x) {
										sliderElements[i].style.left = sliderWidth; //przesuwam w lewo zgodnie z petla
										slide(sliderElements[x], sliderElements[i]);
									} else {
										sliderElements[i].style.left = '-'+sliderWidth; //wrzucam przed aktywny element
										slide(sliderElements[x], sliderElements[i], 'right'); //przesuwam je w prawo, jeden trafia na scene a drugi do stosu
									}
								}
					
							loop(i); //odpalam petle w miejscu aktywowanego elementu
							}
						}
				}
				
				//ZMIENIAM POZYCJE W MENU
				var menuItem = document.getElementById('pagination').getElementsByTagName('button');	
				for (var i=0;  i<sliderElements.length; i++) {
					if (i==x) {
						menuItem[i].className = 'active';
					} else {
						menuItem[i].removeAttribute('class'); // IE8 -> http://msdn.microsoft.com/en-us/library/ie/ms536696%28v=vs.85%29.aspx
					}
				}
			}
		/*****************AKTUALIZACJA EVENTOW DLA MENU SLIDERA END***********************/		
				
			})(); //KONIEC loop()
	
	} //KONIEC slideShow()