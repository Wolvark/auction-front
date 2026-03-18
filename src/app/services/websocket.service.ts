import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = 'http://localhost:8080/ws';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private client: Client;
  private connected = false;
  private pendingSubscriptions: Array<() => void> = [];

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
      reconnectDelay: 5000,
      onConnect: () => {
        this.connected = true;
        this.pendingSubscriptions.forEach((fn) => fn());
        this.pendingSubscriptions = [];
      },
      onDisconnect: () => {
        this.connected = false;
      },
    });
    this.client.activate();
  }

  subscribeToAuctionBids(auctionId: number): Observable<unknown> {
    const subject = new Subject<unknown>();
    const destination = `/topic/auction/${auctionId}/bids`;

    const doSubscribe = () => {
      this.client.subscribe(destination, (message: IMessage) => {
        try {
          subject.next(JSON.parse(message.body));
        } catch {
          subject.next(message.body);
        }
      });
    };

    if (this.connected) {
      doSubscribe();
    } else {
      this.pendingSubscriptions.push(doSubscribe);
    }

    return subject.asObservable();
  }

  ngOnDestroy(): void {
    this.client.deactivate();
  }
}
