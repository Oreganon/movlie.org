async function get_movies() {
    let response = await fetch("movies.json");
    return await response.json();
}


// returns the xth day this wordle is by
function movlie_number() {
    const now = new Date();  
    now.setUTCHours(0, 0, 0, 0);  // go by utc

    let day = Math.floor(now/8.64e7) - 19058;
    return day;
}

async function get_votes(id) {
    let response = await fetch("/screenshots/" + id + "/votes.json");
    if (response.status == 404) {
        return {Votes:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]};
    }
    return await response.json();
}

async function flash(text) {
    let flash_element = document.getElementById("flasher");
    flash_element.innerText = text;
    flash_element.classList.remove("hide");
    await new Promise(r => setTimeout(r, 1000));
    flash_element.classList.add("hide");
}

function updateClipboard(newClip) {
  navigator.clipboard.writeText(newClip).then(function() {
      // success
  }, function() {
      alert("Copying to clipboard not supported :(");
  });
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

