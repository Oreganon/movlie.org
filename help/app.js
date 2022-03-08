const TRIES = 6;

async function get_movies() {
    let response = await fetch("/movies.json");
    return await response.json();
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

    const url = "/submit";
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

    const last_won = parseInt(localStorage.getItem("last_won")) || 0;
    if (last_won != movlie_number()) {
        document.getElementById("cheat").classList.remove("hide");
        return;
    }

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

