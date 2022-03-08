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
    await setup_globals();

    const last_won = parseInt(localStorage.getItem("last_won")) || 0;
    const last_lost = parseInt(localStorage.getItem("last_lost")) || 0;
    if (last_won != movlie_number() && last_lost != movlie_number()) {
        document.getElementById("cheat").classList.remove("hide");
        return;
    }

    document.getElementById("name").innerHTML = solution;

    window.selected = [];

    for (var i = 0; i <= TOTALIMGS; ++i) {
        let url = "/screenshots/" + solution_imdb + "/" + i + ".png";
        let img = document.getElementById(String(i));
        img.src = url;

    }
}
main()

