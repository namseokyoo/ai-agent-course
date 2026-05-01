const lectures = {
  "1": { title: "1강 · AI 에이전트란 무엇인가", folder: "lecture-01-bright-agent-classroom-v4", prefix: "lecture-01-v4-slide", count: 8 },
  "2": { title: "2강 · 실제 에이전트 활용방안", folder: "lecture-02-bright-agent-classroom-v7-singlepass", prefix: "lecture-02-v7-slide", count: 10 },
  "3": { title: "3강 · 에이전트에게 제대로 지시하는 법", folder: "lecture-03-bright-agent-classroom-v7-singlepass", prefix: "lecture-03-v7-slide", count: 8 },
  "4": { title: "4강 · Hermes로 보는 에이전트 환경", folder: "lecture-04-bright-agent-classroom-v7-singlepass", prefix: "lecture-04-v7-slide", count: 10 },
} as const

type LectureKey = keyof typeof lectures

function initCourseSlideshow() {
  const root = document.getElementById("course-slideshow-root")
  if (!root) return

  const select = document.getElementById("lectureSelect") as HTMLSelectElement | null
  const stage = document.getElementById("slideStage") as HTMLElement | null
  const img = document.getElementById("slideImage") as HTMLImageElement | null
  const caption = document.getElementById("slideCaption") as HTMLElement | null
  const startBtn = document.getElementById("startBtn") as HTMLButtonElement | null
  const fullscreenBtn = document.getElementById("fullscreenBtn") as HTMLButtonElement | null
  const prevBtn = document.getElementById("prevBtn") as HTMLButtonElement | null
  const nextBtn = document.getElementById("nextBtn") as HTMLButtonElement | null
  if (!select || !stage || !img || !caption || !startBtn || !fullscreenBtn || !prevBtn || !nextBtn) return

  const qs = new URLSearchParams(location.search)
  let lectureNo = ((qs.get("lecture") || "1") in lectures ? (qs.get("lecture") || "1") : "1") as LectureKey
  let slideNo = Math.max(1, Number(qs.get("slide") || 1))

  if (!select.dataset.ready) {
    select.innerHTML = ""
    for (const [key, lecture] of Object.entries(lectures)) {
      const option = document.createElement("option")
      option.value = key
      option.textContent = lecture.title
      select.appendChild(option)
    }
    select.dataset.ready = "true"
  }

  function slidePath(lecture: (typeof lectures)[LectureKey], num: number) {
    const n = String(num).padStart(2, "0")
    return `assets/${lecture.folder}/${lecture.prefix}-${n}.png`
  }

  function render(push = true) {
    const lecture = lectures[lectureNo]
    slideNo = Math.min(Math.max(slideNo, 1), lecture.count)
    select!.value = lectureNo
    img!.src = slidePath(lecture, slideNo)
    img!.alt = `${lecture.title} ${slideNo}페이지`
    caption!.textContent = `${lecture.title} · ${slideNo}페이지 / ${lecture.count}페이지`
    if (push) history.replaceState(null, "", `?lecture=${lectureNo}&slide=${slideNo}`)
  }

  function next() { slideNo += 1; render() }
  function prev() { slideNo -= 1; render() }
  async function fullscreen() {
    if (!document.fullscreenElement) await stage!.requestFullscreen?.()
    stage!.focus()
  }

  if (!root.dataset.bound) {
    select.addEventListener("change", () => {
      lectureNo = select.value as LectureKey
      slideNo = 1
      render()
    })
    startBtn.addEventListener("click", fullscreen)
    fullscreenBtn.addEventListener("click", fullscreen)
    nextBtn.addEventListener("click", next)
    prevBtn.addEventListener("click", prev)
    document.addEventListener("keydown", (event) => {
      if (!document.getElementById("course-slideshow-root")) return
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") { event.preventDefault(); next() }
      if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); prev() }
      if (event.key.toLowerCase() === "f") { event.preventDefault(); fullscreen() }
    })
    root.dataset.bound = "true"
  }

  render(false)
}

document.addEventListener("nav", initCourseSlideshow)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCourseSlideshow)
} else {
  initCourseSlideshow()
}
