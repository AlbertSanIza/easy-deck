import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

type Slide = {
    _id: string
    _creationTime: number
    title: string
    content: Array<{
        type: string
        text?: string
        imageUrl?: string
    }>
    createdAt: number
    updatedAt: number
}

export function SlidesList() {
    const slides = useQuery(api.slides.list) as Slide[] | undefined

    if (!slides || slides.length === 0) {
        return (
            <div className="text-center text-gray-500">
                <p>No slides yet. Go to the chat interface to create your first slide!</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Your Slides</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {slides.map((slide, index) => (
                    <div key={slide._id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="mb-2 text-sm font-semibold text-gray-500">Slide {index + 1}</div>
                        <h3 className="mb-2 text-lg font-bold text-gray-900">{slide.title}</h3>
                        <div className="space-y-2">
                            {slide.content.map((item, i) => (
                                <div key={i} className="text-sm text-gray-600">
                                    {item.type === 'text' && <p>{item.text}</p>}
                                    {item.type === 'image' && item.imageUrl && (
                                        <img
                                            src={item.imageUrl}
                                            alt="Slide content"
                                            className="h-24 w-full rounded object-cover"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
