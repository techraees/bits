import { Component } from "react";
import PropTypes from "prop-types";

const canUseDOM = () =>
  typeof window !== "undefined" &&
  !!window.document &&
  !!window.document.createElement;

export const ZendeskAPI = (...args) => {
  if (canUseDOM() && window.zE) {
    window.zE.apply(null, args);
  } else {
    console.warn("Zendesk is not initialized yet");
  }
};

class Zendesk extends Component {
  insertScript(zendeskKey, defer) {
    const script = document.createElement("script");
    script.id = "ze-snippet";
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${zendeskKey}`;
    if (defer) script.defer = true;
    else script.async = true;
    script.addEventListener("load", this.props.onLoaded);
    document.body.appendChild(script);
  }

  componentDidMount() {
    if (canUseDOM() && !window.zE) {
      const { defer, zendeskKey, ...other } = this.props;
      window.zESettings = other;
      this.insertScript(zendeskKey, defer);
    }
  }

  componentWillUnmount() {
    if (canUseDOM()) {
      delete window.zE;
      delete window.zESettings;
      const s = document.getElementById("ze-snippet");
      if (s) s.remove();
    }
  }

  render() {
    return null;
  }
}

Zendesk.propTypes = {
  zendeskKey: PropTypes.string.isRequired,
  defer: PropTypes.bool,
  onLoaded: PropTypes.func,
};

export default Zendesk;
