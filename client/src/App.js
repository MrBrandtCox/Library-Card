import React from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';
import Navbar from './components/Navbar';

// GraphQL API endpoint
const httpLink = createHttpLink({
  uri: '/graphql'
})

// middleware to push JWT token to every request
const authLink = setContext((_, { headers }) => {
  // get the JWT token from local storage
  const token = localStorage.getItem('id_token')

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})

// create new instance of ApolloClient 
const client = new ApolloClient({
  // executes middleware before making requst to API
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})

function App() {
  return (
    // call our ApolloProvider tag and pass in client object
    <ApolloProvider client={client}>
      <Router>
        <>
          <Navbar />
          <Routes>
            <Route
              path='/'
              element={<SearchBooks />}
            />
            <Route
              path='/saved'
              element={<SavedBooks />}
            />
            <Route
              path='*'
              element={<h1 className='display-2'>Wrong page!</h1>}
            />
          </Routes>
        </>
      </Router>
    </ApolloProvider>
  );
}

export default App;
