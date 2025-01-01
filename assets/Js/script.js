'use strict'

const slideWrapper = document.querySelector('[data-slide="wrapper"]');
const slideList = document.querySelector('[data-slide="list"]');
const navPreviewsButton = document.querySelector('[data-slide="nav-previews-button"]');
const navNextButton = document.querySelector('[data-slide="nav-next-button"]');
const controlsWrapper = document.querySelector('[data-slide="controls-wrapper"]');

let controlButtons;

let slideItems = document.querySelectorAll('[data-slide="item"]');

let slideInterval;


const state = {
    autoPlay: true,
    currentPoint: 0,
    currentSlideIndex: 0,
    movement: 0,
    savedPosition: 0,
    startingPoint: 0,
    timeInterval: 3000
}

function translateSlide({ position }) {
    state.savedPosition = position;
    slideList.style.transform = `translateX(${position}px)`
}

function getCenterPosition({ index }) {
    const slideItem = slideItems[index];
    const slideWidth = slideItem.clientWidth;
    const windowWidth = document.body.clientWidth;
    const margin = (windowWidth - slideWidth) / 2;
    const position = margin - (index * slideWidth);

    return position;
}

function setVisibleSlide({ index, animate }) {

    if (index === 0 || slideItems.length === -1) {
        index = state.currentSlideIndex;
    }
    if (slideItems.length === -1) {
        index = state.currentSlideIndex;
    }

    const position = getCenterPosition({ index });
    slideList.style.transition = animate === true ? 'transform .5s' : 'none';
    state.currentSlideIndex = index;
    activeControlButton({ index })
    translateSlide({ position: position });

}

function nextSlide() {
    setVisibleSlide(({ index: state.currentSlideIndex + 1, animate: true }));
}

function previewsSlide() {
    setVisibleSlide(({ index: state.currentSlideIndex - 1, animate: true }));
}


function onMouseDown(event, index) {
    const slideItem = event.currentTarget;
    slideList.style.transition = 'none';
    state.startingPoint = event.clientX;
    state.currentSlideIndex = index;
    slideItem.addEventListener('mousemove', onMouseMove);
    state.currentPoint = state.startingPoint - state.savedPosition;

}

function onMouseMove(event) {
    state.movement = event.clientX - state.startingPoint;
    const position = event.clientX - state.currentPoint;
    translateSlide({ position: position });

}

function onMouseUp(event) {

    const pointsToMove = event.type.includes('touch') ? 50 : 150

    if (state.movement < (-pointsToMove)) {
        nextSlide();
    }
    else if (state.movement > (pointsToMove)) {
        previewsSlide();
    } else {

        setVisibleSlide(({ index: state.currentSlideIndex, animate: true }));

    }

    const slideItem = event.currentTarget;

    slideItem.removeEventListener('mousemove', onMouseMove);

}

function onTouchStart(event, index){
    
    event.clientX = event.touches[0].clientX;
    onMouseDown(event, index);
    const slideItem = event.currentTarget;
    slideItem.addEventListener('touchmove', onTouchMove);
}

function onTouchMove(event){
    event.clientX = event.touches[0].clientX
    onMouseMove(event);
}

function onTouchEnd(event){
    onMouseUp(event)
    const slideItem = event.currentTarget;
    slideItem.removeEventListener('touchemove', onTouchMove);

}

function createControlButton() {
    slideItems.forEach(function () {
        const controlButtons = document.createElement('button');
        controlButtons.classList.add('slide-control-button');
        controlButtons.classList.add('fa');
        controlButtons.classList.add('fa-circle');
        controlButtons.dataset.slide = 'control-button';

        controlsWrapper.append(controlButtons);
    })
}

function activeControlButton({ index }) {
    const slideItem = slideItems[index];
    const dataIndex = Number(slideItem.dataset.index);
    const controlButton = controlButtons[dataIndex];
    controlButtons.forEach(function (controlButtonItem) {
        controlButtonItem.classList.remove('active')
    })
    if (controlButton) {
        controlButton.classList.add('active');
    }
}

function createSlideClones() {
    const firstSlide = slideItems[0].cloneNode(true);
    firstSlide.classList.add('slide-cloned');
    firstSlide.dataset.index = slideItems.length;
    const secondSlide = slideItems[1].cloneNode(true);
    secondSlide.classList.add('slide-cloned');
    secondSlide.dataset.index = slideItems.length + 1;

    const lastSlide = slideItems[slideItems.length - 1].cloneNode(true);
    lastSlide.classList.add('slide-cloned');
    lastSlide.dataset.index = -1;

    const penultimateSlide = slideItems[slideItems.length - 2].cloneNode(true);
    penultimateSlide.classList.add('slide-cloned');
    penultimateSlide.dataset.index = -2;

    slideList.append(firstSlide);
    slideList.append(secondSlide);
    slideList.prepend(lastSlide);
    slideList.prepend(penultimateSlide);

    slideItems = document.querySelectorAll('[data-slide="item"]');

}

function onControlButtonClick(index) {
    setVisibleSlide({ index: index + 2, animate: true });
}

function onSlideListTransitionEnd() {

    if (state.currentSlideIndex === slideItems.length - 2) {
        setVisibleSlide({ index: 2, animate: false });
    }
    if (state.currentSlideIndex === 1) {
        setVisibleSlide({ index: slideItems.length - 3, animate: false });
    }
}

function setAutoPlay(){
    if(state.autoPlay){
      slideInterval = setInterval(function() {
        setVisibleSlide({index: state.currentSlideIndex + 1, animate: true})
    }, state.timeInterval);  
    }
    
}

function setListners() {
    controlButtons = document.querySelectorAll('[data-slide="control-button"]');
    controlButtons.forEach(function (controlButton, index) {
        controlButton.addEventListener('click', function (event) {
            onControlButtonClick(index);
        })
    })

    slideItems.forEach(function (slideItem, index) {
        slideItem.addEventListener('dragstart', function (event) {
            event.preventDefault();
        })
        slideItem.addEventListener('mousedown', function (event) {
            onMouseDown(event, index);
        })
        slideItem.addEventListener('mouseup', onMouseUp);

        slideItem.addEventListener('touchstart', function (event) {
            onTouchStart(event, index);
        })
        slideItem.addEventListener('touchend', onTouchEnd);

    })

    navNextButton.addEventListener('click', nextSlide);
    navPreviewsButton.addEventListener('click', previewsSlide);
    slideList.addEventListener('transitionend', onSlideListTransitionEnd)
    slideWrapper.addEventListener('mouseenter', function(){
        clearInterval(slideInterval);
    })
    slideWrapper.addEventListener('mouseleave', function(){
        setAutoPlay();
    })

    let resizeTimeOut;
    window.addEventListener('resize', function(){
        clearTimeout(resizeTimeOut);
        resizeTimeOut = setTimeout(function(){
            setVisibleSlide({index: state.currentSlideIndex, animate: true});
        }, 1000);
    })

}

function initSliders({startAtIndex = 0, autoPlay = true, timeInterval = 3000}) {

    state.autoPlay = autoPlay;
    state.timeInterval = timeInterval;

    createControlButton();
    createSlideClones()
    setListners();
    setVisibleSlide({ index: startAtIndex + 2, animate: true });
    setAutoPlay()
}



