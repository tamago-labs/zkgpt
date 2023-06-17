import MainLayout from "@/layouts/mainLayout";
import { useContext, useEffect, useState } from "react"
import { Edit, Edit2, Terminal, Database } from "react-feather"
import Query from "../../components/query"
import EditCollection from "../../components/edit"
import { GptContext } from "@/hooks/useGPT";
import { useWeb3React } from "@web3-react/core";


const NAV = {
    EDIT: "EDIT",
    QUERY: "QUERY"
}

const IconWrapper = ({ children, onClick }) => {
    return (
        <div onClick={onClick} class="mx-auto text-white p-4 cursor-pointer">
            {children}
        </div>
    )
}


export default function Collection({ slug }) {

    const { account } = useWeb3React()

    const [nav, setNav] = useState(NAV.QUERY)
    const { getCollection } = useContext(GptContext)

    const [ collection, setCollection ] = useState()

    useEffect(() => {
        account && slug && getCollection(slug).then(setCollection)
    },[slug, account])
 
    return (
        <MainLayout>
            <div class="bg-gray-800 w-20 flex-none flex flex-col pt-4">
                <IconWrapper onClick={() => setNav(NAV.QUERY)}>
                    <Terminal />
                </IconWrapper>
                <IconWrapper onClick={() => setNav(NAV.EDIT)}>
                    <Database />
                </IconWrapper>
            </div>
            <div class="  flex-grow bg-gray-900 text-white overflow-y-auto flex flex-col">
                {nav === NAV.QUERY && <Query collection={collection} slug={slug} />}
                {nav === NAV.EDIT && <EditCollection collection={collection} slug={slug} />}
            </div>
        </MainLayout>
    )
}

export const getStaticPaths = async () => {
    return { paths: [], fallback: "blocking" };
}

export async function getStaticProps(context) {

    const { params } = context
    const { slug } = params

    return {
        props: {
            slug
        }
    };
}