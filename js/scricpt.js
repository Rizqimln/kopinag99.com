// toggle class active hamburger menu

const navbarNav = document.querySelector('.navbar-nav');

document.querySelector('#hamburger-menu').
onclick = (e) => {
    navbarNav.classList.toggle('active');
    e.preventDefault();
}

// toggle search
const searchFrom=document.querySelector('.search-from');
const serchBox=document.querySelector('#search-box');

document.querySelector('#search-button').
onclick = (e) => {
    searchFrom.classList.toggle('active');
    serchBox.focus();
    e.preventDefault();
}

// klik shooping menu
const shoopingCard=document.querySelector('.shoping-card');

document.querySelector('#shopping-card').
onclick =(e)=> {
shoopingCard.classList.toggle('active')
e.preventDefault();
}


// klik menu diluar sidebar

const hm = document.querySelector('#hamburger-menu');
const sb = document.querySelector('#search-button');
const sc = document.querySelector('#shopping-card');

document.addEventListener('click', function(e){
    if(!hm.contains(e.target) && !navbarNav.contains(e.target)){
        navbarNav.classList.remove('active')
    }

    if(!sb.contains(e.target) && !searchFrom.contains(e.target)){
        searchFrom.classList.remove('active')
    }
    if(!sc.contains(e.target) && !shoopingCard.contains(e.target)){
        shoopingCard.classList.remove('active')
    }
});
