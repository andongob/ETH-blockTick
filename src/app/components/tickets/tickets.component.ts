import { Component, OnInit } from '@angular/core';
import Web3 from 'web3';
import { WalletService } from 'src/app/wallet.service';
import { ABI as NFTblockTickABI } from 'src/ABI/NFTblockTickABI';
declare let window: any;

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements OnInit {
  wallet: any = {
    address: ''
  };
  web3: any;
  walletAddress: string = '';
  ticketAmount: number = 0;
  ticketPrice: number = 1;
  etherAmount: number = 0;
  contract: any; // Instancia del contrato EventNFTManager
  transactionResult: string = '';
  nftContract: any;
  nftContractAddress: any = '0xDb885a7cd58aD7cA96fAb45A0F8574140627002B';
  gas: string = '200000';



  constructor(public walletService: WalletService) {
    this.web3 = new Web3(new Web3.providers.HttpProvider('https://sepolia.infura.io/v3/87388b2cafcd4bcdbb26947767a1869f'));
    this.nftContract = new this.web3.eth.Contract(NFTblockTickABI.default, this.nftContractAddress);

    console.log('nftContract:', this.nftContract);

    this.wallet = {
      address: '',
      privateKey: ''
    };
  }

  async ngOnInit() {
    try {
      await this.walletService.initWallet('member cushion summer grid staff card owner hazard multiply trial panel now');
      this.wallet = this.walletService.wallet;
      // await this.loadNFTs();
    } catch (error) {
      console.error('Error al inicializar la billetera:', error);
    }
  }

  isUserLoggedIn(): boolean {
    if (this.walletService && this.walletService.wallet && this.walletService.wallet.walletAddress) {
      return this.walletService.web3.utils.isAddress(this.walletService.wallet.walletAddress);
    }
    return false;
  }

  disconnectWallet() {
    this.wallet = {
      address: '',
      privateKey: ''
    };
    this.walletService.wallet = this.wallet; // También puedes actualizar el servicio si es necesario
  }
  

  async buyTickets() {
    // Obtén el valor del precio del ticket y el número de tickets de las propiedades del componente
    const ticketPrice = await this.nftContract.methods.ticketPrice().call();
    const amount = 1; // Comprar 1 ticket

    // Calcula el valor en wei necesario
    const value = ticketPrice * amount;

    try {
      const fromAddress = '0x5af1c8af38844b0fce9b0798c968f721cd0b484f'; // Reemplaza con la dirección del remitente real

      // Crea una transacción y firma
      const tx = {
        from: fromAddress,
        to: this.nftContractAddress,
        value: value,
        gas: this.gas,
        data: this.nftContract.methods.buyTickets(fromAddress, amount).encodeABI()
      };

      // Firma la transacción con la clave privada (debes gestionar esto de manera segura)
      const signedTx = await this.web3.eth.accounts.signTransaction(tx, 'YOUR_PRIVATE_KEY');

      // Envía la transacción firmada
      const result = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      console.log('Resultado de la compra de tickets:', result);
      // Actualiza el estado de tu aplicación o muestra un mensaje de confirmación aquí
    } catch (error) {
      console.error('Error al comprar tickets:', error);
      // Maneja el error apropiadamente (muestra un mensaje de error, etc.)
    }
  }

  async buyOneTicketForMe() {
    // Comprar 1 ticket para el usuario actual
    const amount = 1;
  
    // Obtén el valor del precio del ticket
    const ticketPrice = await this.nftContract.methods.ticketPrice().call();
  
    try {
      // Comprueba si MetaMask está instalado y configurado en el navegador
      if (typeof window !== 'undefined' && 'ethereum' in window) {
        const ethereum = window['ethereum'];
  
        // Solicita al usuario que apruebe la transacción
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  
        if (accounts.length === 0) {
          // El usuario no aprobó la transacción
          console.error('El usuario no aprobó la transacción.');
          return;
        }
  
        const fromAddress = accounts[0];
  
        // Crea una transacción
        const tx = {
          from: fromAddress,
          to: this.nftContractAddress,
          value: ticketPrice,
          gas: this.gas,
          data: this.nftContract.methods.buyOneTicketForMe().encodeABI()
        };
  
        // Envía la transacción a través de MetaMask
        const result = await ethereum.request({ method: 'eth_sendTransaction', params: [tx] });
  
        console.log('Resultado de la compra de un ticket para el usuario actual:', result);
        // Actualiza el estado de tu aplicación o muestra un mensaje de confirmación aquí
      } else {
        console.error('MetaMask no está instalado o configurado en el navegador.');
        // Muestra un mensaje al usuario para que instale y configure MetaMask
      }
    } catch (error) {
      console.error('Error al comprar un ticket para el usuario actual:', error);
      // Maneja el error apropiadamente (muestra un mensaje de error, etc.)
    }
  }
  
}
