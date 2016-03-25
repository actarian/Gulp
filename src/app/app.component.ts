
import {Component, OnInit, View} from "angular2/core";
import {HTTP_PROVIDERS} from "angular2/http";
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from "angular2/router";

import {HelloComponent} from "./components/hello/hello.component";

@RouteConfig([
    { path: "/hello", name: "Hello", component: HelloComponent, useAsDefault: true },
])
@Component({
    selector: "[app]",
    viewProviders: [HTTP_PROVIDERS],
    providers: [ROUTER_PROVIDERS],
})
@View({
    directives: [ROUTER_DIRECTIVES],
    templateUrl: "./app/app.component.html",
    styleUrls: ["./app/app.component.css"],
})
export class App implements OnInit {
    constructor() {
    }
    ngOnInit() {
        console.log("App.onInit");        
    }
}
