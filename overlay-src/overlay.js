import { createElementFromTarget } from "@/components/Anime/Timeline/libs/createAnimeFromFile";

// import getAttrs from "@/components/Anime/Timeline/libs/getAttrs";
import getStyle from "@/components/Anime/Timeline/libs/getStyle";
import getTrans from "@/components/Anime/Timeline/libs/getTrans";

import io from "socket.io-client";
import animejs from "animejs";

const socket = io("/overlay", {
  transports: ["websocket"],
  upgrade: false,
});

const playables = ["audio", "video"];

const $main = document.querySelector("main");

function runAnime(action, cb) {
  const $anime = document.createElement("div");

  const timeline = animejs.timeline({
    autoplay: false,
    update() {
      console.log((this.duration / 100) * this.progress);
    },
    complete() {
      $anime.remove();
      cb({ success: true, action });
    },
  });

  const promises = [];

  action.data.forEach((item) => {
    promises.push(
      createElementFromTarget(item.target).then((element) => {
        const style = getStyle(item.target.style);
        const trans = getTrans(item.target.trans);
        element.setAttribute("id", `item-${item.id}`);
        element.setAttribute("style", `${style};${trans}`);
        Object.entries(item.target.attrs).forEach(([key, val]) => {
          element.setAttribute(key, val);
        });
        element.style.position = "absolute";

        const targets = element;
        const isPlayable = playables.includes(item.target.type);

        const play = () => {
          element.volume = item.target.attrs.volume;
          element.currentTime = 0;
          element.play();
        };

        const stop = () => {
          element.pause();
          element.currentTime = 0;
        };

        const begin = () => isPlayable && play();
        const complete = () => isPlayable && stop();

        item.keyframes.forEach(({ delay, duration, attrs, style, trans }) => {
          const props = { ...attrs, ...style, ...trans };
          timeline.add({ targets, duration, ...props, begin, complete }, delay);
        });

        return element;
      })
    );
  });

  Promise.all(promises)
    .then((elements) => {
      elements.forEach((element) => {
        $anime.appendChild(element);
      });
      $main.appendChild($anime);
      timeline.play();
    })
    .catch((error) => {
      cb({ error, action });
      $anime.remove();
    });
}

socket.on("actions.start", (action, cb) => {
  if (action.type === "anime") {
    runAnime(action, cb);
  }
});
