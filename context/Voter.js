import React, {useState ,useEffect} from 'react';
import Web3Modal from "web3modal";
import {ethers} from "ethers";
import {create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import {useRouter} from "next/router";

// Internal import

import { VotingAddress, VotingAddressABI } from "./constants";


const projectId = '2PizfJHh6a8khExDdTLbSQxkjlA';
const projectSecret = 'dd1b7cd8d7f51afd9931bc1f1364184f';
const auth = 'Basic ' + Buffer.from(projectId + ":" + projectSecret).toString('base64')

const client = ipfsHttpClient({
   host:'ipfs.infura.io',
   port: 5001,
   protocol:"https",
   headers: {  
      authorization: auth,
   },
});   


const fetchContract = (signerOrProvider) => 
new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);

 export const VotingContext = React.createContext();

 export const VotingProvider = ({children}) => {
   const votingTitle = 'My first smart contract app';
 const router = useRouter();
 const [currentAccount, setCurrentAccount] = useState('');
 const [candidateLength, setCandidateLength] = useState('');
 const pushCandidate = [];
 const cadidateIndex = [];
 const [candiateArray, setCandidateArray] = useState(pushCandidate)

 // ..........END OF CANDIDATE DATA......... 

 const [error, setError] = useState(''); 
 const higestVote = []; 


 //>>>>>>>>Voter Section

 const pushVoter = [];
 const [voterArray, setVoterArray] = useState(pushVoter);
 const [voterLength, setVoterLength] = useState('');
 const [voterAddress, setVoterAddress] = useState([]);

 ///=======Connecting to Metamask.......

 const checkIfWalletIsConnected = async ()=>{
   if(!window.ethereum) return setError("Please Install MetaMask");

   const account = await window.ethereum.request({method:"eth_accounts"});

   if(account.length){
      setCurrentAccount(account[0]);
   }else{
      setError("Please Install MetaMask & Connect, Reload");
   }
 };

 //---- CONNECT WALLET
 const connectWallet = async() => {
   if(!window.ethereum) return setError("Please Install MetaMask ");

   const account = await window.ethereum.request({method: "eth_requestAccounts",
});
   
   setCurrentAccount(account[0])
 };

//  /--- UPLOAD TO IPFS VOTER IMAGE;

 const uploadToIPFS = async(file)=>{
   try{
      const added = await client.add({content: file});
      // const added = await client.add(file);

      const url = `https://cullout.infura-ipfs.io/ipfs/${added.cid.toString()}`;

      return url;  
   }catch(error){
      setError("Error Uploading file to IPFS")
   }
 };



 /// -----------Create Voter

 const createVoter = async(formInput, fileUrl, router) =>{
   try{
      const {name, address, position} = formInput;

      if(!name || !address || !position)
      return setError("Input data is missing");

      // Connecting smart Contract..........
      const web3Modal = new Web3Modal();  
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);
      

      const data = JSON.stringify({name, address, position, image: fileUrl});
      const added = await client.add(data);

      const url = `https://cullout.infura-ipfs.io/ipfs/${added.cid.toString()}`;
   
      const voter = await contract.voterRight(address, name, url, fileUrl);
      voter.wait()

      console.log(voter);

      // router.push("/voterList");
   } catch (error){
      setError("Error in creating voter")
   }
 };


   
    return( 
    <VotingContext.Provider 
    value={{
      votingTitle,
     checkIfWalletIsConnected, 
     connectWallet,
     uploadToIPFS,
     createVoter,
     }}>
      {children} 
      </VotingContext.Provider>
    );   
 };
 

