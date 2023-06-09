 
const MainLayout = ({ children }) => {
    return (
        <main>
            <div class="flex h-screen">
                
                <div class="flex-1 flex flex-col">
                    {children}
                </div>
            </div>
        </main>
    )
}

export default MainLayout