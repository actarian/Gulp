
// ///<reference path="../../node_modules/angular2/typings/browser.d.ts"/> 

import {bootstrap} from "angular2/platform/browser";
import {HTTP_BINDINGS} from "angular2/http";
import {ROUTER_BINDINGS, ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from "angular2/router";
import {provide} from "angular2/core";
import {App} from "./app.component";

bootstrap(App, [ROUTER_BINDINGS, HTTP_BINDINGS, ROUTER_PROVIDERS, provide(LocationStrategy, { useClass: HashLocationStrategy })]);
