import { SpinnerWithRow } from "@/components/loading";
import { PromptContext } from "@/hooks/usePrompt";
import FullLayout from "@/layouts/fullLayout";
import { useContext, useEffect, useState } from "react";


export default function Home() {

  const { check } = useContext(PromptContext)
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    check().then(
      (res) => {
        setLoading(false)
      }
    )

  }, [])


  return (
    <main>
      <FullLayout>

        {loading && (
          <SpinnerWithRow
            text="Connecting pragma node..."
          />
        )

        }

      </FullLayout>
    </main>
  )
}