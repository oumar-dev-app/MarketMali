"use client";

import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";


interface User {

  uuid: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  role: string;
  status: string;

}



const getStatusBadge = (status:string)=>{

  switch(status){

    case "active":
      return "bg-green-100 text-green-800";

    case "blocked":
      return "bg-red-100 text-red-800";

    default:
      return "bg-gray-100 text-gray-800";

  }

};



export default function ProfilPage(){


  const [user,setUser] =
    useState<User|null>(null);


  const [loading,setLoading] =
    useState(true);



  useEffect(()=>{


    const fetchUser = async()=>{


      try{


        const token =
          localStorage.getItem("token");


        const response =
          await fetch(
            "/api/auth/me",
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

          setUser(
            result.data
          );

        }


      }catch(error){

        console.error(error);

      }finally{

        setLoading(false);

      }


    };


    fetchUser();


  },[]);




  if(loading){

    return (
      <div className="p-6">
        Chargement...
      </div>
    );

  }




  if(!user){

    return (
      <div className="p-6">
        Utilisateur introuvable.
      </div>
    );

  }




  return (

    <div className="p-6">


      <h1 className="text-2xl font-bold mb-6">
        Mon profil
      </h1>



      <div className="border rounded-lg p-6 bg-white">


        <div className="flex items-center gap-4 mb-6">


          <FaUserCircle
            className="text-gray-400"
            size={70}
          />


          <div>

            <h2 className="text-xl font-bold">

              {user.prenom} {user.nom}

            </h2>


            <span
              className={
                `px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(user.status)}`
              }
            >

              {user.status}

            </span>


          </div>


        </div>




        <div className="grid md:grid-cols-2 gap-4">


          <p>
            <strong>Email :</strong>{" "}
            {user.email}
          </p>


          <p>
            <strong>Téléphone :</strong>{" "}
            {user.telephone || "-"}
          </p>


          <p>
            <strong>Rôle :</strong>{" "}
            {user.role}
          </p>


          <p>
            <strong>UUID :</strong>{" "}
            {user.uuid}
          </p>


        </div>


      </div>


    </div>

  );

}
