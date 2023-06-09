
const Header = () => {
    return (
        <div class="grid grid-cols-2 gap-3 px-2 mt-4 mb-4">
            <div class="col-span-1 flex flex-row">
                <h1 class="text-3xl text-white font-bold">
                    zkPragma
                </h1>
                <p class="text-sm text-gray-300 mt-auto mb-auto ml-3 hidden md:block ">Decentralized vector data querying & indexing protocol</p>
            </div>
            <div class="col-span-1">
                <div class="flex flex-row ">

                    <div class="flex-1 text-right">

                        <button type="button" onClick={() => alert("hello")} class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Connect Wallet</button>


                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header