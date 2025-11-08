//WE KEEP ALL UNUSED FUNCTION HERE

// import {buildStoryHeader, handleStoryClick, createStoryElement, fetchHostData, groupStories, getStoryViewElements, clearOldStories, decryptStories, getUserId,} from './helpers.js'

// //function for getting group stories...
// export default function groupStories(stories) {
//   return stories.reduce((acc, item) => {
//     const key = item.id;
//     if (!acc[key]) acc[key] = [];
//     acc[key].push({
//       image: item.story_url,
//       date: item.post_date,
//       description: item.caption
//     });
//     return acc;
//   }, {});
// };


// //function for fetch host data....
// export default async function fetchHostData(story_id) {
//   const rsp = await fetch(`${MAIN_SERVER}/sknpbkdf_rd`, {
//     method: "POST", credentials: "include",
//     headers: JSON_HEAD,
//     body: JSON.stringify({
//       collection: "users",
//       attribute: "profile,business",
//       id: story_id
//     })
//   });
//   return rsp.json();
// };


// //function for getting user ID 
// export default function getUserId() {
//   let user_id = localStorage.getItem("auth");
//   try {
//     user_id = JSON.parse(user_id).user.id;
//   } catch {
//     user_id = "guest";
//   }
//   return user_id;
// };



// //function for decrptstories....
// export default async function decryptStories(json_data) {
//   const parts = json_data.split("uuid-");
//   const decrypted = await decrypt(parts[0], `uuid-${parts[1]}`);
//   const stories = JSON.parse(decrypted);
//   stories.sort((a, b) => new Date(b.post_date) - new Date(a.post_date));
//   return stories;
// };


// //function for clear Old stories....
// export default function clearOldStories(storiesCont) {
//   storiesCont.querySelectorAll(".storyCont:not(.addStory)").forEach(el => el.remove());
// };


// //function for get storyView elements
// export default function getStoryViewElements() {
//   const storyView = document.querySelector(".floater-pages .storyView");
//   return {
//     storyView,
//     storyImg: storyView.querySelector(".storyImg"),
//     storyLine: storyView.querySelector(".storyLine"),
//     storyHead: storyView.querySelector(".storyHead .leftData"),
//     storyDescr: storyView.querySelector(".descComment p")
//   };
// };

// //function for handle story click
// export default function handleStoryClick(story, profile, business, els) {
// //thisfunction use buildStoryHeader function

//   let timeout = 0;
//   let active_item = -1;
//   let window_touch = false;
//   const badge = business?.kyc?.verification_type || "null";

//   els.storyImg.style.backgroundImage = `url(${story[0].image})`;
//   els.storyHead.innerHTML = buildStoryHeader(profile, badge, story[0].date);
//   els.storyLine.innerHTML = "";

//   story.forEach(() => {
//     const line = document.createElement("div");
//     line.style = "--timeout: 5s;";
//     line.className = "line";
//     els.storyLine.appendChild(line);
//   });

//   els.storyView.addEventListener("touchstart", () => (window_touch = true));
//   els.storyView.addEventListener("touchend", () => (window_touch = false));

//   const storyInterval = setInterval(() => {
//     if (window_touch) return;
//     if (timeout === 0) {
//       active_item += 1;
//       if (active_item >= story.length) {
//         document.body.removeAttribute("ios");
//         closeFloater(".storyView");
//         switchTheme();
//         setTimeout(() => { document.body.setAttribute("ios", ""); }, 1000);
//         return clearInterval(storyInterval);
//       };

//       timeout = 5;
//       els.storyHead.querySelector(".timing").innerHTML = formatDate(story[active_item].date);
//       els.storyImg.style.backgroundImage = `url(${story[active_item].image})`;
//       els.storyLine.querySelectorAll(".line")[active_item].classList.add("active");
//       els.storyDescr.innerHTML = story[active_item].description;
//     }
//     timeout -= 1;
//   }, 1000);

//   getFloater(".storyView");
// };


// //function for create story element
// export default function createStoryElement(story, profile) {
//   const newStory = document.createElement("div");
//   newStory.className = "storyCont";
//   newStory.innerHTML = `
//     <div class="story" style='background-image: url(${story[0].image});'>
//       <img src="${profile.avatar_url}" class="pinProfile">
//     </div>
//     <p class='username'>${cropText(profile.username, 11).cropped}</p>`;
//   return newStory;
// };