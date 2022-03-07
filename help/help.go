package main

import (
    "encoding/json"
    "errors"
    "log"
    "net/http"
    "io/ioutil"
    "os"
)

type test_struct struct {
    Id string
    Selected []int
}

type Votes struct {
    Votes [16]int
}

func exists(path string) bool {
    _, err := os.Stat(path)
    return !errors.Is(err, os.ErrNotExist)
}

func test(rw http.ResponseWriter, req *http.Request) {
    body, err := ioutil.ReadAll(req.Body)
    if err != nil {
        panic(err)
    }
    var t test_struct
    err = json.Unmarshal(body, &t)
    if err != nil {
        panic(err)
    }

    var votes = "../screenshots/" + t.Id + "/votes.json"

    if !exists(votes) {
        log.Println("creating file" + t.Id)
        v := Votes{}
        v.Votes = [16]int{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}
        content, err := json.Marshal(v)
        err = ioutil.WriteFile(votes, content, 0644)
        if err != nil {
            log.Fatal(err)
        }
    }
    
    var content, err2 = ioutil.ReadFile(votes)
	if err2 != nil {
		log.Fatal(err)
	}
    v := Votes{}
	err = json.Unmarshal(content, &v)
	if err != nil {
		log.Fatal(err)
	}

    for _, i := range t.Selected {
        v.Votes[i] += 1
    }

    content, err = json.Marshal(v)
    err = ioutil.WriteFile(votes, content, 0644)
    if err != nil {
        log.Fatal(err)
    }

}

func main() {
    http.HandleFunc("/submit", test)
    log.Fatal(http.ListenAndServe(":8080", nil))
}

