const LCL_STG_KEY = "spotify-prev-lists";
const TOKEN_LIFE = 50 * 60 * 1000;
const MAX_PLAYLISTS = 3;
var histCtr = 0;
var intervalCtrl = {};

var genre;
var genreList = [];
var prevPlaylistName = "";
var prevPlaylist = [];
var histPlaylists = [];
var token;


var createTrackEl = function (ulPlayListEl, track) {
   var anchorElPreview = document.createElement("a");
   anchorElPreview.className = "playlist-item-pv";
   anchorElPreview.href = track.preview;
   anchorElPreview.textContent = "Preview - ";
   anchorElPreview.target = "_blank";
   anchorElPreview.rel = "noreferrer noopener";


   var anchorElFull = document.createElement("a");
   anchorElFull.className = "playlist-item-full";
   anchorElFull.href = track.trackUrl;
   anchorElFull.textContent = track.name;
   anchorElFull.target = "_blank";
   anchorElFull.rel = "noreferrer noopener";

   var spanEl = document.createElement("span");
   spanEl.textContent = ", with " + track.artistName;


   var liEl = document.createElement("li");
   liEl.className = "playlist-item-li";
   liEl.appendChild(anchorElPreview);
   liEl.appendChild(anchorElFull);
   liEl.appendChild(spanEl);

   ulPlayListEl.appendChild(liEl);
}

function buildPlaylistDOM(playlistData) {
   const SPOTIFY_MARKER = 0;

   var removeUl = document.getElementById("playlist-group")
   if (removeUl) {
      removeUl.remove();
   }

   var ulPlayListEl = document.createElement("ul");
   ulPlayListEl.className = "playlist-group";
   ulPlayListEl.id = "playlist-group";

   prevPlaylistName = genre;
   prevPlaylist = [];

   var tempDataLength = playlistData.tracks.length;
   for (var i = 0; i < tempDataLength; ++i) {
      var track = {
         preview: playlistData.tracks[i].preview_url,
         name: playlistData.tracks[i].name,
         url: playlistData.tracks[i].artists[SPOTIFY_MARKER].external_urls.spotify,
         artistName: playlistData.tracks[i].artists[SPOTIFY_MARKER].name,
      }
      if (track.preview) {
         createTrackEl(ulPlayListEl, track);
         prevPlaylist.push(track);
      }
   }
   document.getElementById("head-id").after(ulPlayListEl);
   var prevPlaylistObj = {
      prevPlaylistName: prevPlaylistName,
      prevPlaylist: prevPlaylist,
   };

   histPlaylists.push(prevPlaylistObj);
   if (histCtr++ >= MAX_PLAYLISTS) {
      histPlaylists.shift();
   }
   localStorage.setItem(LCL_STG_KEY, JSON.stringify(histPlaylists));

};

async function getPlayListData() {
   const response = await fetch("https://api.spotify.com/v1/recommendations?market=US&seed_genres=" + genre, {
      headers: {
         Accept: "application/json",
         Authorization: "Bearer " + token,
         "Content-Type": "application/json"
      }
   });
   const playlistData = await response.json();
   buildPlaylistDOM(playlistData);
};

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

}

async function getGenreListData() {
   const response = await fetch("https://api.spotify.com/v1/recommendations/available-genre-seeds", {
      headers: {
         Accept: "application/json",
         Authorization: "Bearer " + token,
         "Content-Type": "application/json"
      }
   });
   const genreData = await response.json();
   genreList = genreData.genres;
   buildGenreDOM();
   document.getElementById("genre-list-group").addEventListener("change", function () {
      genre = document.getElementById("genre-list-group").value;
      getPlayListData();
   });

}

async function getNewToken() {
   const response = await fetch('https://accounts.spotify.com/api/token', {
      body: 'grant_type=client_credentials',
      headers: {
         Authorization: 'Basic ZDY4NzJhMGRlNjFhNGVhMDg3NDYwNTJlYWRlYjdjN2I6NDExOWExZGRmODRiNGI2ZTg5OWY3Mjc2OGViZDA1YTM=',
         'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST'
   });
   const tokenData = await response.json();
   token = tokenData.access_token;
   getGenreListData();
};

function startMusic() {
   getNewToken();
   intervalCtrl = setInterval(getNewToken, TOKEN_LIFE);
}


startMusic();
