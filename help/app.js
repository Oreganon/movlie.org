const TRIES = 6;

async function get_movies() {
    let response = await fetch("/movies.json");
    return await response.json();
}

/**
 * Creates a pseudo-random value generator. The seed must be an integer.
 * https://gist.github.com/blixt/f17b47c62508be59987b
 *
 * Uses an optimized version of the Park-Miller PRNG.
 * http://www.firstpr.com.au/dsp/rand31/
 */
function Random(seed) {
  this._seed = seed % 2147483647;
  if (this._seed <= 0) this._seed += 2147483646;
}

/**
 * Returns a pseudo-random value between 1 and 2^32 - 2.
 * https://gist.github.com/blixt/f17b47c62508be59987b
 */
Random.prototype.next = function () {
  return this._seed = this._seed * 16807 % 2147483647;
};


/**
 * Returns a pseudo-random floating point number in range [0, 1).
 * https://gist.github.com/blixt/f17b47c62508be59987b
 */
Random.prototype.nextFloat = function (opt_minOrMax, opt_max) {
  // We know that result of next() will be 1 to 2147483646 (inclusive).
  return (this.next() - 1) / 2147483646;
};

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 * https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array/6274381#6274381
 */
function shuffle(a) {
    let rand = new Random(1);
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand.nextFloat() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function todays_movie(imdb_ids) {
    let shuffled = shuffle(imdb_ids);
    const now = new Date();  
    now.setUTCHours(0, 0, 0, 0);  // go by utc

    let days_since_epoch = Math.floor(now/8.64e7);
    return shuffled[days_since_epoch % (shuffled.length - 1)];
}

const TOTAL = 6;
const TOTALIMGS = 15;

function highlight_selected() {
    for (var i = 0; i <= TOTALIMGS; ++i) {
        let img = document.getElementById(String(i));
        img.classList.remove("selected");
        if (selected.includes(i)) {
            img.classList.add("selected");
        }
    }
}

function handle_select(e) {
    let num = Number(e.id);
    if (selected.includes(num)) {
        selected = selected.filter(function(e) { return e != num});
    } else {
        if (selected.length == TOTAL) {
            selected = selected.slice(1); // remove the first element
        }

        selected.push(num);
    }


    highlight_selected();

    let btn = document.getElementById("submit");
    if (selected.length == TOTAL) {
        btn.classList.remove("disabled");
    } else {
        btn.classList.add("disabled");
    }
}

function submit() {
    if (selected.length < TOTAL) {
        alert("Select " + TOTAL + " images first!");
        return;
    }

    const url = "http://localhost:8080/submit";
    fetch(url, {
        method : "POST",
         body : JSON.stringify({
             id : solution_imdb,
             selected : selected,
        })
    }).then(
        response => response.text() 
    ).then(
        html => window.location.replace("/thanks")
    );
}


async function main() {
    window.current_guess = 0;
    window.movies = await get_movies();
    window.names = [];
    window.imdb_ids = [];
    let solution_eligible = [];
    for (let i = 0; i < movies.length ; ++i) {
        names.push(movies[i][1]);
        imdb_ids.push(movies[i][0]);
        if (movies[i][2] == "true") {
            solution_eligible.push(i);
        }
    }

    // find the solution, always the same for the whole UTC day
    window.solution_index = Number(todays_movie(solution_eligible));
    window.solution = names[solution_index];
    window.solution_imdb = imdb_ids[solution_index];

    document.getElementById("name").innerHTML = solution;

    window.selected = [];

    for (var i = 0; i <= TOTALIMGS; ++i) {
        let url = "/screenshots/" + solution_imdb + "/" + i + ".png";
        let img = document.getElementById(String(i));
        img.src = url;

    }
}
main()

let modals = document.getElementsByClassName("modal");
let openers = document.getElementsByClassName("modal_open");
let closers = document.getElementsByClassName("modal_close");


for (let o of openers) {
    o.onclick = function() {
        let modal = document.getElementById(o.id + "_modal")
        modal.style.display = "block";
    }
}

for (let c of closers) {
    c.onclick = function() {
        for (let m of modals) {
            m.style.display = "none";
        }
    }
}

window.onclick = function(event) {
    for (let m of modals) {
        if (event.target == m) {
            m.style.display = "none";
        }
    }
} 
