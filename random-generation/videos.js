let vidIndex = 0;
let vidArray = []

// Fetch the json data containing every video link and title.
let items;
fetch("https://api.jsonbin.io/v3/b/6799a021ad19ca34f8f626af")
    .then(function(response){
        response.json()
        .then(function(data){
            let videos = data.record[0].videos;
            videos.forEach(element => {
                vidArray.push({'title': element.title, 'embed': element.embed});
            });
        });
    });

// console.log(vidArray);
let iFrame = document.querySelector('iframe');

// add event listeners for previous and next buttons to modify vidIndex
let vidTitle = document.querySelector('#video-title');
let previousButton = document.querySelector('#backward-button');
previousButton.addEventListener('click', function () {
    if (vidIndex != 0) {
        vidIndex -= 1;
    } else {
        alert("You're already at the first video!")
    }
    // console.log(vidIndex);
    iFrame.src = 'https://www.youtube.com/embed/' + vidArray[vidIndex].embed;
    vidTitle.innerHTML = vidArray[vidIndex].title;
})

let nextButton = document.querySelector('#forward-button');
nextButton.addEventListener('click', function () {
    if (vidIndex >= vidArray.length) {
        alert('No more videos posted!');
    } else {
        vidIndex += 1;
    }
    // console.log(vidIndex);
    if (vidArray[vidIndex].embed) {
        iFrame.src = 'https://www.youtube.com/embed/' + vidArray[vidIndex].embed;
        vidTitle.innerHTML = vidArray[vidIndex].title;
    }
})

// Add event listener for random video button that randomizes the vidIndex
let randomVideoButton = document.querySelector('#random-video-button');
randomVideoButton.addEventListener('click', function () {
    let random_number = Math.floor(Math.random() * vidArray.length);
    vidIndex = random_number;
    iFrame.src = 'https://www.youtube.com/embed/' + vidArray[vidIndex].embed;
    vidTitle.innerHTML = vidArray[vidIndex].title;
})