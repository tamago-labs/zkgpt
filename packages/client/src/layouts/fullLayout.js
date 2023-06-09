import Header from "@/components/header"


const FullLayout = ({ children }) => {
    return (
        <main class="  bg-gray-800 text-white">
            <div class="flex h-screen flex-col container mx-auto">
                <Header />
                {children}
            </div>
        </main>
    )
}

export default FullLayout