// // we improve the code by creating heplers.js so we 
// //split a huge api.handler.js into small chunks 

// import {JSON_HEAD} from './utils/jsonHead.js' 

// export default function renderLocations(data) {
//   const locations = JSON.parse(localStorage.getItem("sokoni_locations") || "[]");
//   const container = document.getElementById("locations");
//   if (!container) return;
//   container.innerHTML = `<i class="fi fi-rr-angle-small-right getOpts"></i>`;

//   locations.forEach((loc, idx) => {
//     const div = document.createElement("div");
//     div.className = "optSlt" + (idx === 0 ? " active" : "");
//     div.innerHTML = `
//       <i class="fi ${idx === 0 ? "fi-sr-home-location" : "fi-sr-marker"}"></i>
//       <div class="data">
//         <h4>${loc.title}</h4>
//         <p>${loc.address.length > 25 ? loc.address.slice(0, 25) + "..." : loc.address}</p>
//       </div>
//       <i class="fi fi-rr-check"></i>
//     `;
//     div.addEventListener("click", () => {
//       container.querySelectorAll(".optSlt").forEach(el => el.classList.remove("active"));
//       div.classList.add("active");
//       localStorage.setItem("location_index", String(idx))
//       renderPrices(data, idx)
//     });
//     container.appendChild(div);
//   });
// };

// //this is function for render prices
// export default function renderPrices(data, location){
//   let allPTags = document.querySelectorAll(".checkout p[tag]");
//   allPTags[0].textContent = `Tzs.${formatMoney(data.total)}/-`
//   allPTags[1].textContent = `Tzs.${(formatMoney(Math.round(data.distances[location] * 450)))}/-`;
//   allPTags[2].textContent = `Tzs.${formatMoney(data.total + Math.round(data.distances[location] * 450))}/-`;
// };


// //this is function for collect profile data
// export default function collectProfileData() {
//   const data = {};
//   document.querySelectorAll('[idTag]').forEach(el => {
//     const id = el.getAttribute('idTag');
//     let value = '';

//     if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
//       value = el.value.trim();
//     } else {
//       const inner = el.querySelector('input, textarea, select');
//       if (inner) value = inner.value.trim();
//     }
//     if (value) data[id] = value;
//   });
//   data["name"] = `${data.firstName} ${data.lastName}`;
//   console.log(data)
//   return data;
// };



// //function for fetch some stories
// export default async function fetchStories() {
//   const rsp = await fetch(`${MAIN_SERVER}/get_story`, {
//     method: "POST", credentials: "include",
//     headers: JSON_HEAD,
//     body: JSON.stringify({ id: localStorage.getItem("sokoni_identity") })
//   });
//   return rsp.json();
// };

// //function for building story header....
// export default function buildStoryHeader(profile, badge, date) {
//   return `
//     <img src="${profile.avatar_url}" alt="" class="profilePic">
//     <div class="userData">
//       <h4>${profile.username} <img src="assets/images/badges/${badge}.png"></h4>
//       <div class="group">
//         <p><i class="fi fi-sr-marker"></i> ${profile.address}</p>
//         <p class="timing"><i class="fi fi-sr-calendar"></i> ${formatDate(date)}</p>
//       </div>
//     </div>`;
// };


// //functio for apply Role
//  function applyRole(){
//   let targetElements = [".profileBase.accountSettings"]
//   let role = localStorage.getItem("sokoni_role");
//   targetElements.forEach(el=>{
//     get(el).classList.add(role);
//   })
// };