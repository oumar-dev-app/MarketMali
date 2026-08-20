"use client";

import { useEffect, useState } from "react";
import { FaKey, FaSync, FaBan, FaPlus } from "react-icons/fa";


interface ApiKey {

  uuid: string;
  name: string;
  status: string;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;

}



const getStatusBadge = (status: string) => {

  switch(status) {

    case "active":
      return "bg-green-100 text-green-800";

    case "revoked":
      return "bg-red-100 text-red-800";

    default:
      return "bg-gray-100 text-gray-800";

  }

};



export default function ApiKeysPage() {


  const [apiKeys, setApiKeys] =
    useState<ApiKey[]>([]);


  const [loading, setLoading] =
    useState(true);



  const fetchApiKeys = async () => {

    try {

      const token =
        localStorage.getItem("token");


      const response =
        await fetch(
          "/api/dashboard/api-keys",
          {
            headers:{
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      const result =
        await response.json();


      if(result.success){

        setApiKeys(
          result.data
        );

      }


    } catch(error){

      console.error(
        error
      );

    } finally {

      setLoading(false);

    }

  };




  useEffect(() => {

    fetchApiKeys();

  }, []);





  const createApiKey = async () => {


    const name =
      prompt(
        "Nom de la clé API :"
      );


    if(!name)
      return;



    try {


      const token =
        localStorage.getItem("token");



      const response =
        await fetch(
          "/api/dashboard/api-keys",
          {

            method:"POST",

            headers:{
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json"
            },


            body:
              JSON.stringify({
                name
              })

          }
        );



      const result =
        await response.json();


      if(result.success){

        alert(
          "API Key créée avec succès"
        );

        fetchApiKeys();

      }



    }catch(error){

      console.error(error);

    }


  };





  const actionApiKey = async (
    uuid:string,
    action:"revoke"|"regenerate"
  ) => {


    const confirmation =
      confirm(
        action === "revoke"
          ? "Révoquer cette clé API ?"
          : "Régénérer cette clé API ?"
      );


    if(!confirmation)
      return;



    try {


      const token =
        localStorage.getItem("token");



      const response =
        await fetch(
          `/api/dashboard/api-keys/${uuid}/${action}`,
          {

            method:"PATCH",

            headers:{
              Authorization:
                `Bearer ${token}`
            }

          }
        );



      const result =
        await response.json();



      if(result.success){

        fetchApiKeys();

      }



    }catch(error){

      console.error(error);

    }


  };





  if(loading){

    return (
      <div className="p-6">
        Chargement...
      </div>
    );

  }





  return (

    <div className="p-6">


      <div className="flex justify-between mb-6">


        <h1 className="text-2xl font-bold flex items-center gap-2">

          <FaKey />

          API Keys

        </h1>



        <button

          onClick={createApiKey}

          className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2"

        >

          <FaPlus />

          Nouvelle clé

        </button>


      </div>





      <div className="overflow-x-auto border rounded-lg">


        <table className="min-w-full">


          <thead className="bg-gray-100">

            <tr>

              <th className="px-4 py-3 text-left">
                Nom
              </th>


              <th className="px-4 py-3 text-left">
                Statut
              </th>


              <th className="px-4 py-3 text-left">
                Dernière utilisation
              </th>


              <th className="px-4 py-3 text-left">
                Expiration
              </th>


              <th className="px-4 py-3 text-left">
                Actions
              </th>


            </tr>

          </thead>



          <tbody>


          {
            apiKeys.map(
              (key)=>(

                <tr
                  key={key.uuid}
                  className="border-t"
                >


                  <td className="px-4 py-3">
                    {key.name}
                  </td>



                  <td className="px-4 py-3">

                    <span
                      className={
                        `px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(key.status)}`
                      }
                    >
                      {key.status}
                    </span>

                  </td>




                  <td className="px-4 py-3">

                    {
                      key.last_used_at
                      ?
                      new Date(
                        key.last_used_at
                      ).toLocaleDateString("fr-FR")
                      :
                      "-"
                    }

                  </td>




                  <td className="px-4 py-3">

                    {
                      key.expires_at
                      ?
                      new Date(
                        key.expires_at
                      ).toLocaleDateString("fr-FR")
                      :
                      "-"
                    }

                  </td>



                  <td className="px-4 py-3 flex gap-2">


                    <button

                      onClick={() =>
                        actionApiKey(
                          key.uuid,
                          "regenerate"
                        )
                      }

                      className="bg-blue-600 text-white px-3 py-2 rounded-lg"

                    >

                      <FaSync />

                    </button>



                    <button

                      onClick={() =>
                        actionApiKey(
                          key.uuid,
                          "revoke"
                        )
                      }

                      className="bg-red-600 text-white px-3 py-2 rounded-lg"

                    >

                      <FaBan />

                    </button>


                  </td>



                </tr>

              )

            )
          }


          </tbody>


        </table>


      </div>


    </div>

  );

}
