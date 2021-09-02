var tokenAuthorization = 'Basic ZDY4NzJhMGRlNjFhNGVhMDg3NDYwNTJlYWRlYjdjN2I6MGNkYWE0ZjRiMjUzNGE4YWE0YWQ0YzhmMDc3MGI5MWE=';

var intervalCtrl = {};
const TOKEN_PERIOD = 50 * 60 * 1000;
const LCL_STG = "spotify";
var token;
var genreList = [];
var genre = {};



startMusic();

// $("#genre-list-group").on("change", selectGenre);
document.getElementById("genre-list-group").addEventListener("change", selectGenre);




function startMusic() {
   getNewToken();
   intervalCtrl = setInterval(getNewToken, TOKEN_PERIOD);
   getGenreList();
   buildGenreDOM();
}

function getNewToken() {
   fetch('https://accounts.spotify.com/api/token', {
      body: 'grant_type=client_credentials',
      headers: {
         Authorization: tokenAuthorization,
         'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST'
   })
      .then(response => response.json())
      .then(data => {
         localStorage.setItem(LCL_STG + "-token", JSON.stringify(data.access_token));
      });
   token = JSON.parse(localStorage.getItem(LCL_STG + "-token"));
}

function getGenreList() {
   fetch("https://api.spotify.com/v1/recommendations/available-genre-seeds", {
      headers: {
         Accept: "application/json",
         Authorization: "Bearer " + token,
         "Content-Type": "application/json"
      }
   })
      .then(response => response.json())
      .then(data => {
      
         localStorage.setItem(LCL_STG + "-genre-list", JSON.stringify(data.genres))
      });
   genreList = JSON.parse(localStorage.getItem(LCL_STG + "-genre-list"));
}

function buildGenreDOM() {
   var divGenreEl = document.createElement("div");
   divGenreEl.className = "head";
   divGenreEl.id = "head-id";

   var labelEl = document.createElement("label");
   labelEl.for = "genre-list-group";
   labelEl.textContent = "Choose a music genre .....";

   var selectEl = document.createElement("select");
   selectEl.className = "genre-list-group";
   selectEl.name = "genre-list-group";
   selectEl.id = "genre-list-group";

   var tempLength = genreList.length;
   for (var i = 0; i < tempLength; ++i) {
      var optionEl = document.createElement("option");
      optionEl.textContent = genreList[i];
      optionEl.value = genreList[i];
      optionEl.className = "genre-list-item";
      selectEl.appendChild(optionEl);
   }

   divGenreEl.appendChild(labelEl);
   divGenreEl.appendChild(selectEl);
   document.getElementById("spotify-header").after(divGenreEl);
   // document.body.appendChild(divGenreEl);
}

function selectGenre() {
   // genre = $("#genre-list-group :selected").text().trim();
   genre = document.getElementById('genre-list-group').value;
   buildPlayList();

}

function buildPlayList() {
   fetch("https://api.spotify.com/v1/recommendations?market=US&seed_genres=" + genre, {
      headers: {
         Accept: "application/json",
         Authorization: "Bearer " + token,
         "Content-Type": "application/json"
      }
   })
      .then(response => response.json())
      .then(data => {
         const SPOTIFY_MARKER = 0;

         var removeUl = document.getElementById("play-list-group")
         if (removeUl) {
            removeUl.remove();
         }

         var ulPlayListEl = document.createElement("ul");
         ulPlayListEl.className = "play-list-group";
         ulPlayListEl.id = "play-list-group";

         var dataLength = data.tracks.length;
         for (var i = 0; i < dataLength; ++i) {
            var artistName = data.tracks[i].artists[SPOTIFY_MARKER].name;
            var trackUrl = data.tracks[i].artists[SPOTIFY_MARKER].external_urls.spotify;
            var trackName = data.tracks[i].name;

            var anchorEl = document.createElement("a");
            // anchorEl.className = "play-list-item-a";
            // anchorEl.href = trackUrl;
            // anchorEl.textContent = trackName;
            // anchorEl.target = "_blank"
            // anchorEl.rel = "noreferrer noopener"

            Object.assign(anchorEl, {
               className: 'play-list-item-a',
               href: trackUrl,
               textContent: trackName,
               target: "_blank",
               rel: "noreferrer noopener"
            });

            var spanEl = document.createElement("span");
            spanEl.textContent = ", with " + artistName;


            var liEl = document.createElement("li");
            liEl.className = "play-list-item-li";
            liEl.appendChild(anchorEl);
            liEl.appendChild(spanEl);

            ulPlayListEl.appendChild(liEl);
         }
         document.getElementById("head-id").after(ulPlayListEl);
      });
}







