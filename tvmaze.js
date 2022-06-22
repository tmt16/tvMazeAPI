"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const $query = $("#search-query");
const $episodesButton = $("#episodes-button")


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(query) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.

  const res = await axios.get(`https://api.tvmaze.com/search/shows?q=${query}`)
  const arr = res.data

  const shows = [];

  const defaultImage = "https://tinyurl.com/tv-missing"

  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];

    let image = element.show.image;

    if(element.show.image != null) {
      if(element.show.image.original != null) {
        image = element.show.image.original;
      } else if (element.show.image.medium != null) {
        image = element.show.image.medium;
      } 
    } else{
      image = defaultImage;
    }

    let show = {
      id: element.show.id,
      name: element.show.name,
      image: image,
      summary: element.show.summary 
    }
    shows.push(show)
  }

  return shows;

  // return [
  //   {
  //     id: 1767,
  //     name: "The Bletchley Circle",
  //     summary:
  //       `<p><b>The Bletchley Circle</b> follows the journey of four ordinary 
  //          women with extraordinary skills that helped to end World War II.</p>
  //        <p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their 
  //          normal lives, modestly setting aside the part they played in 
  //          producing crucial intelligence, which helped the Allies to victory 
  //          and shortened the war. When Susan discovers a hidden code behind an
  //          unsolved murder she is met by skepticism from the police. She 
  //          quickly realises she can only begin to crack the murders and bring
  //          the culprit to justice with her former friends.</p>`,
  //     image:
  //         "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
  //   }
  // ]
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    let $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="${show.name}" 
              class="card-img-top">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button type="button" id="episodes-button" class="btn btn-primary Show-getEpisodes">See Episodes</button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function searchShows(event) {
  event.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  let res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  let episodes = res.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }));

  return episodes;

}

/** Write a clear docstring for this function... */

// Next, write a function, populateEpisodes, which is provided an array of episodes info, 
// and populates that into the #episodes-list part of the DOM.

function populateEpisodes(episodes) {
  const $episodesList = $("#episodes-list")
  $episodesList.empty()

  for (let episode of episodes) {
    let $item = $(
      `<li> ${episode.name} (Season ${episode.season}, Episode ${episode.number})</li>`
    )
    $episodesList.append($item)
    }

    $episodesArea.show()
  }

  $("#shows-list").on("click", ".Show-getEpisodes", async function clickEpisode(event) {
    let showId = $(event.target).closest(".Show").data("show-id");
    let episodes = await getEpisodesOfShow(showId);
    populateEpisodes(episodes);
  });