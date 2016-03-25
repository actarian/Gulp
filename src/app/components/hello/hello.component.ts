
// ///<reference path="../../node_modules/angular2/typings/browser.d.ts"/> 

import {Component, OnInit, View} from "angular2/core";

@Component({
    selector: "[hello]",
})
@View({
    templateUrl: "./app/components/hello/hello.component.html",
    styleUrls: ["./app/components/hello/hello.component.css"],
})
export class HelloComponent implements OnInit {
    constructor() {
    }
    ngOnInit() {
        console.log("Hello.onInit");        
    }
}
