"use strict";

import React from "react";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";

import Head from "next/head";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import Footer from "./footer";

import routes from "../utils/routes";

let ps;

class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColor: "black",
      activeColor: "info"
    };
    this.mainPanel = React.createRef();
  }
  componentDidMount() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(this.mainPanel.current);
      document.body.classList.toggle("perfect-scrollbar-on");
    }
  }
  componentWillUnmount() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps.destroy();
      document.body.classList.toggle("perfect-scrollbar-on");
    }
  }
  // MAKE SURE LINKS ALWAYS SCROLL TO TOP IN ALL PANELS BEFORE DELETING
  // Below function is from paper-dashboard but isn't compatible with my routing
  // Next.js <Link> *should* take care of scrolling, though https://nextjs.org/docs#disabling-the-scroll-changes-to-top-on-page
  // componentDidUpdate(e) {
  //   if (e.history.action === "PUSH") {
  //     this.mainPanel.current.scrollTop = 0;
  //     document.scrollingElement.scrollTop = 0;
  //   }
  // }

  render() {
    return (
      <div className="wrapper">
        <Head>
          <title>{"Stars Align" + (this.props.pageTitle && " | " + this.props.pageTitle)}</title>
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
        </Head>

        <Sidebar
          {...this.props}
          routes={routes}
          bgColor={this.state.backgroundColor}
          activeColor={this.state.activeColor}
        />
        <div className="main-panel" ref={this.mainPanel}>
          <Navbar {...this.props} />
          {this.props.children}
          <Footer fluid />
        </div>
      </div>
    );
  }
}

export default Layout;
