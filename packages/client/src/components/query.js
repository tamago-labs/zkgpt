

const Query = ({ slug }) => {
    return (
        <div class="w-full">
            <div class="grid grid-cols-2">
                <div class="col-span-1 p-6">
                    <div class="flex flex-col mb-2">
                        <h1 class="text-2xl text-white font-bold  mb-2">
                            Query Hub
                        </h1>
                        <h1 class="text-xl text-gray-400 font-bold  mb-2">
                            {slug}
                        </h1>
                    </div>
                </div>
                <div class="bg-gray-800 h-screen col-span-1">
                    right
                </div>
            </div>
        </div>
    )
}

export default Query