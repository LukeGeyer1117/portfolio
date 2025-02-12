// let number = document.querySelector('#dice-holder p');
// let numButton = document.querySelector('#numButton');
// let fortune = document.querySelector('#fortune');

// let diceHolder = document.querySelector('#dice-holder');

// // Set the initial value of the dice to a placeholder text.
// let diceHolderText = document.querySelector("#dice-holder p");
// diceHolderText.innerHTML = 'Choose a Dice';

// // Add an event listener to populate the value in the dice 
// // as well as the fortune below based on the type of dice
// // selected by the user. Handle the case if the user hasn't
// // selected a dice yet.
// let diceType = false;
// numButton.addEventListener('click', function () {
//     const number = document.querySelector("#dice-holder p");

//     const fortune = document.querySelector("#fortune");
//     if (diceType == false) {
//         fortune.innerHTML = 'Select a dice type first!' 
//     }
//     else if (diceType === 'd6') {
//         for (let i = 0; i < 20; i++) {
//             setTimeout(() => {
//                 const randomNumber = Math.floor(Math.random() * 6) + 1;
//                 number.innerHTML = randomNumber;
//             }, i * 100); // 100ms delay per iteration
//         }

//         setTimeout(() => {
//             const finalNumber = number.innerHTML;
//             if (finalNumber == 1) {
//                 fortune.innerHTML = "Try Again!";
//             } else if (finalNumber == 2) {
//                 fortune.innerHTML = "Better luck next time.";
//             } else if (finalNumber == 3) {
//                 fortune.innerHTML = "Getting there...";
//             } else if (finalNumber == 4) {
//                 fortune.innerHTML = "Not too bad.";
//             } else if (finalNumber == 5) {
//                 fortune.innerHTML = "That's pretty good!";
//             } else {
//                 fortune.innerHTML = "WINNER!";
//             }
//         }, 20 * 100); // 20 iterations
//     }
//     else if (diceType === 'd20') {
//         for (let i = 0; i < 20; i++) {
//             setTimeout(() => {
//                 const randomNumber = Math.floor(Math.random() * 20) + 1;
//                 number.innerHTML = randomNumber;
//             }, i * 100); // 100ms delay per iteration
//         }

//         setTimeout(() => {
//             const finalNumber = number.innerHTML;
//             if (finalNumber == 1) {
//                 fortune.innerHTML = "Try Again!"
//             } else if (finalNumber <= 5) {
//                 fortune.innerHTML = "Better luck next time.";
//             } else if (finalNumber <= 10) {
//                 fortune.innerHTML = "Getting there...";
//             } else if (finalNumber <= 15) {
//                 fortune.innerHTML = "Not too bad.";
//             } else if (finalNumber <= 19) {
//                 fortune.innerHTML = "That's pretty good!";
//             } else {
//                 fortune.innerHTML = "WINNER!";
//             }
//         }, 20 * 100); // 20 iterations * 100ms = 2000ms (2 seconds)
//     }

// })

// // Add an event listener for each dice type button so that they 
// // change diceType when pressed.
// let diceTypeButtons = document.querySelectorAll("#dice-picker button");
// diceTypeButtons.forEach(button => {
//     button.addEventListener('click', function () {
//         console.log(`buttonInnerHTML: ${button.innerHTML}`);
//         diceType = button.innerHTML.trim();
//         console.log(`diceType: ${diceType}`);
//         let number = document.querySelector('#dice-holder p');
//         number.innerHTML = '';

//         // set the background image of #dice-holder accordingly
//         if (diceType === 'd6') {
//             diceHolder.style.backgroundImage = "url('images/square-thin.svg')";
//         }
//         else if (diceType === 'd20') {
//             diceHolder.style.backgroundImage = "url('images/d20SVG.png')";
//         }
//         else {
//             console.log('issue setting diceType!');
//         }
//     });
// });


