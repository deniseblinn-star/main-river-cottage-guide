import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const photos = [
  { src: '/photos/morning-mist.jpeg', alt: 'Morning mist over Main River' },
  { src: '/photos/tube-day.jpeg', alt: 'Kids on the tube behind the boat' },
  { src: '/photos/boat-day.jpeg', alt: 'Family boat day' },
  { src: '/photos/first-boat-ride.jpeg', alt: 'First boat ride' },
  { src: '/photos/family-boat.jpeg', alt: 'Family together on the boat' },
  { src: '/photos/captains-seat.jpeg', alt: 'A day on the river' },
  { src: '/photos/cottage.jpeg', alt: 'The Main River cottage' },
  { src: '/photos/river-kids.jpeg', alt: 'Kids by the river' },
  { src: '/photos/learning-to-drive.jpeg', alt: 'Learning to drive the boat' },
  { src: '/photos/boat-wake.jpeg', alt: 'Boat wake on the river' }
]

export default function PhotoRail() {
  const [start, setStart] = useState(0)
  const [open, setOpen] = useState(null)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStart(current => (current + 1) % photos.length)
    }, 9000)
    return () => window.clearInterval(timer)
  }, [])

  const visible = useMemo(
    () => [0, 1, 2].map(offset => photos[(start + offset) % photos.length]),
    [start]
  )

  const previous = () => setStart(current => (current - 1 + photos.length) % photos.length)
  const next = () => setStart(current => (current + 1) % photos.length)

  return <>
    <aside className="hidden xl:block">
      <div className="sticky top-20 space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="section-title">From Main River</p>
          <div className="flex gap-1">
            <button onClick={previous} className="photo-control" aria-label="Previous photos"><ChevronLeft size={16}/></button>
            <button onClick={next} className="photo-control" aria-label="Next photos"><ChevronRight size={16}/></button>
          </div>
        </div>

        <button onClick={() => setOpen(visible[0])} className="photo-tile photo-tile-feature">
          <img src={visible[0].src} alt={visible[0].alt}/>
        </button>

        <div className="grid grid-cols-2 gap-3">
          {visible.slice(1).map(photo =>
            <button key={photo.src} onClick={() => setOpen(photo)} className="photo-tile photo-tile-small">
              <img src={photo.src} alt={photo.alt}/>
            </button>
          )}
        </div>

        <p className="px-1 text-xs leading-5 text-stone">
          A quiet rotating window into the river. Click any image to view it full-screen.
        </p>
      </div>
    </aside>

    <section className="xl:hidden mt-5">
      <div className="flex items-center justify-between mb-3">
        <p className="section-title">From Main River</p>
        <div className="flex gap-1">
          <button onClick={previous} className="photo-control" aria-label="Previous photos"><ChevronLeft size={16}/></button>
          <button onClick={next} className="photo-control" aria-label="Next photos"><ChevronRight size={16}/></button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {visible.map((photo, index) =>
          <button key={photo.src} onClick={() => setOpen(photo)} className={`photo-tile ${index === 0 ? 'h-48 col-span-2' : 'h-48'}`}>
            <img src={photo.src} alt={photo.alt}/>
          </button>
        )}
      </div>
    </section>

    {open && <div className="fixed inset-0 z-[80] bg-black/90 p-4 flex items-center justify-center" onClick={() => setOpen(null)}>
      <button className="absolute right-5 top-5 rounded-full bg-white/15 p-2 text-white" aria-label="Close photo"><X/></button>
      <img src={open.src} alt={open.alt} className="max-h-[92vh] max-w-[94vw] rounded-2xl object-contain shadow-2xl"/>
    </div>}
  </>
}
