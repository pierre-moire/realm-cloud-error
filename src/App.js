import React, {Component} from "react";

import {Credentials, User, GraphQLConfig} from "realm-graphql-client";
import {WebSocketLink} from "apollo-link-ws";
import ApolloClient from "apollo-client";
import {HttpLink, InMemoryCache, gql} from "apollo-client-preset";
import {getMainDefinition} from "apollo-utilities";
import {ApolloLink} from "apollo-link";

import List from "./components/List";

import "./App.css";

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            items: []
        }
    }

    async componentDidMount() {
        const credentials = Credentials.usernamePassword("admin", "admin");
        const user = await User.authenticate(credentials, "https://dt.de1a.cloud.realm.io");

        const config = await GraphQLConfig.create({
            user: user,
            realmPath: "/default"
        });

        console.log(config.httpEndpoint, config.webSocketEndpoint, config.connectionParams);

        const httpLink = ApolloLink.concat(
            config.authLink,
            // Note: if using node.js, you'll need to provide fetch as well.
            new HttpLink({uri: config.httpEndpoint})
        );

        // Note: if using node.js, you'll need to provide webSocketImpl as well.
        const subscriptionLink = new WebSocketLink({
            uri: config.webSocketEndpoint,
            options: {
                connectionParams: config.connectionParams
            }
        });

        // Send subscription operations to the subscriptionLink and
        // all others - to the httpLink
        const link = ApolloLink.split(
            ({query}) => {
                const {kind, operation} = getMainDefinition(query);
                return kind === "OperationDefinition" && operation === "subscription";
            },
            subscriptionLink,
            httpLink
        );

        this.client = new ApolloClient({
            link: link,
            cache: new InMemoryCache()
        });

        const response = await this.client.query({
            query: gql`
                    query {
                        items {
                            id
                            name
                            x
                            y
                        }
                    }
                `
        })
            .then(result => console.log(result));

        this.setState({
            items: response.data
        })
    }

    render() {
        return (
            <div className="App">
                <List items={this.state.items}/>
            </div>
        );
    }
}

export default App;
