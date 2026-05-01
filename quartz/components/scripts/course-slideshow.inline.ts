const lectures = {
  "1": { title: "1강 · AI 에이전트란 무엇인가", folder: "lecture-01-bright-agent-classroom-v4", prefix: "lecture-01-v4-slide", count: 8 },
  "2": { title: "2강 · 실제 에이전트 활용방안", folder: "lecture-02-bright-agent-classroom-v7-singlepass", prefix: "lecture-02-v7-slide", count: 10 },
  "3": { title: "3강 · 에이전트에게 제대로 지시하는 법", folder: "lecture-03-bright-agent-classroom-v7-singlepass", prefix: "lecture-03-v7-slide", count: 8 },
  "4": { title: "4강 · Hermes로 보는 에이전트 환경", folder: "lecture-04-bright-agent-classroom-v7-singlepass", prefix: "lecture-04-v7-slide", count: 10 },
} as const

type LectureKey = keyof typeof lectures

let lectureNo: LectureKey = "1"
let slideNo = 1
let touchStartX = 0
let touchStartY = 0
let touchStartTime = 0

function courseEls() {
  return {
    root: document.getElementById("course-slideshow-root"),
    select: document.getElementById("lectureSelect") as HTMLSelectElement | null,
    stage: document.getElementById("slideStage") as HTMLElement | null,
    img: document.getElementById("slideImage") as HTMLImageElement | null,
    caption: document.getElementById("slideCaption") as HTMLElement | null,
  }
}

function slidePath(lecture: (typeof lectures)[LectureKey], num: number) {
  const n = String(num).padStart(2, "0")
  return `assets/${lecture.folder}/${lecture.prefix}-${n}.png`
}

function readUrlState() {
  const qs = new URLSearchParams(location.search)
  const requestedLecture = qs.get("lecture") || "1"
  lectureNo = (requestedLecture in lectures ? requestedLecture : "1") as LectureKey
  slideNo = Math.max(1, Number(qs.get("slide") || 1))
}

function renderCourseSlide(push = true) {
  const { root, select, img, caption } = courseEls()
  if (!root || !select || !img || !caption) return

  const lecture = lectures[lectureNo]
  slideNo = Math.min(Math.max(slideNo, 1), lecture.count)
  select.value = lectureNo
  img.src = slidePath(lecture, slideNo)
  img.alt = `${lecture.title} ${slideNo}페이지`
  caption.textContent = `${lecture.title} · ${slideNo}페이지 / ${lecture.count}페이지`
  if (push) history.replaceState(null, "", `?lecture=${lectureNo}&slide=${slideNo}`)
}

function nextCourseSlide() {
  const lecture = lectures[lectureNo]
  slideNo = slideNo >= lecture.count ? lecture.count : slideNo + 1
  renderCourseSlide()
}

function prevCourseSlide() {
  slideNo = slideNo <= 1 ? 1 : slideNo - 1
  renderCourseSlide()
}

async function openCourseFullscreen() {
  const { stage } = courseEls()
  if (!stage) return
  if (!document.fullscreenElement) await stage.requestFullscreen?.()
  stage.focus()
}

function populateLectureSelect() {
  const { select } = courseEls()
  if (!select || select.dataset.ready) return
  select.innerHTML = ""
  for (const [key, lecture] of Object.entries(lectures)) {
    const option = document.createElement("option")
    option.value = key
    option.textContent = lecture.title
    select.appendChild(option)
  }
  select.dataset.ready = "true"
}

function initCourseSlideshow() {
  const { root } = courseEls()
  if (!root) return
  populateLectureSelect()
  readUrlState()
  renderCourseSlide(false)
}

// Event delegation is used because Quartz SPA navigation can replace the page body.
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null
  if (!target || !document.getElementById("course-slideshow-root")) return

  const button = target.closest("button") as HTMLButtonElement | null
  if (!button) return

  if (button.id === "nextBtn") {
    event.preventDefault()
    nextCourseSlide()
  } else if (button.id === "prevBtn") {
    event.preventDefault()
    prevCourseSlide()
  } else if (button.id === "startBtn" || button.id === "fullscreenBtn") {
    event.preventDefault()
    openCourseFullscreen()
  }
})

document.addEventListener("change", (event) => {
  const target = event.target as HTMLElement | null
  if (!target || target.id !== "lectureSelect") return
  lectureNo = (target as HTMLSelectElement).value as LectureKey
  slideNo = 1
  renderCourseSlide()
})

document.addEventListener("keydown", (event) => {
  if (!document.getElementById("course-slideshow-root")) return
  if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
    event.preventDefault()
    nextCourseSlide()
  }
  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault()
    prevCourseSlide()
  }
  if (event.key.toLowerCase() === "f") {
    event.preventDefault()
    openCourseFullscreen()
  }
})

document.addEventListener("touchstart", (event) => {
  if (!document.getElementById("course-slideshow-root")) return
  const touch = event.changedTouches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  touchStartTime = Date.now()
}, { passive: true })

document.addEventListener("touchend", (event) => {
  if (!document.getElementById("course-slideshow-root")) return
  const touch = event.changedTouches[0]
  const dx = touch.clientX - touchStartX
  const dy = touch.clientY - touchStartY
  const dt = Date.now() - touchStartTime
  const horizontalSwipe = Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4 && dt < 900
  if (!horizontalSwipe) return
  if (dx < 0) nextCourseSlide()
  else prevCourseSlide()
}, { passive: true })

document.addEventListener("nav", initCourseSlideshow)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCourseSlideshow)
} else {
  initCourseSlideshow()
}
