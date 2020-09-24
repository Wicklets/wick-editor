/*
 * Copyright 2020 WICKLETS LLC
 *
 * This file is part of Wick Editor.
 *
 * Wick Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Editor.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { Component, Fragment} from 'react';
import WickModal from 'Editor/Modals/WickModal/WickModal';

import flashy from '../../../resources/support-us-icons/flashy.png';
import patreonLogoWhite from '../../../resources/support-us-icons/patreon-logo-white.svg';
import githubLogoWhite from '../../../resources/support-us-icons/github-logo-white.svg';
import githubHeart from '../../../resources/support-us-icons/github-heart.svg';
import facebookIcon from '../../../resources/support-us-icons/facebook.svg';
import instagramIcon from '../../../resources/support-us-icons/instagram.svg';
import twitterIcon from '../../../resources/support-us-icons/twitter.svg';
import youtubeIcon from '../../../resources/support-us-icons/youtube.svg';
import whiteHeart from '../../../resources/support-us-icons/white-heart.svg';


import './_supportus.scss';

let classNames=require("classnames");

class SupportUs extends Component {
  constructor () {
    super();

    this.progressData = {patreonProgress: 280, 
                        patreonGoal: 3000, 
                        githubProgress: 1, 
                        githubGoal: 10};
  }

  renderMobileModal(contentDisplay, footerDisplay) {
    return (
      <WickModal
      open={this.props.open}
      toggle={this.props.toggle}
      className="support-modal-body-mobile"
      overlayClassName="support-modal-overlay">
        <div id="support-modal-interior-content">
          <div id="support-modal-title-mobile">
            <img id="support-modal-title-img-mobile" src={whiteHeart} alt="white heart icon" style={{width: "24px", height: "auto", marginRight: "10px", display: "inline-block"}}></img>
            <p id="support-modal-title-text">Support Us!</p>
          </div>
          {contentDisplay}
        </div>
        {footerDisplay}
      </WickModal>
    )
  }

  renderDesktopModal(contentDisplay, footerDisplay) {
    return (
      <WickModal
      open={this.props.open}
      toggle={this.props.toggle}
      className="support-modal-body"
      overlayClassName="support-modal-overlay">
        <div id="support-modal-interior-content">
          <div id="support-modal-title">
            <img id="support-modal-title-img" alt="Wick Editor ghost flashy" src={flashy}></img>
            <p id="support-modal-title-text">Wick Editor is supported by you!</p>
          </div>

          <p id="support-modal-benefit-text">Get Merch, get featured, and help Wick Editor Grow!</p>

          <div class="support-modal-row">
            {contentDisplay}
          </div>
          
          {footerDisplay}
        </div>
      </WickModal>
    )
  }

  render() {
    const contentDisplay = [<Fragment>
      <div class={(this.props.isMobile)?"support-modal-col":"support-modal-col left-col"}>
        <div class="support-modal-col-title">
          <img src={patreonLogoWhite} alt="white patreon logo" class="support-modal-col-title-img"></img>
          <p class="support-modal-col-title-text">Patreon</p>
        </div>
        <p class="support-modal-col-text">for individuals and creators</p>
        <div class="support-modal-progress-bar"><div class="support-modal-patreon-progress" style={{width:this.progressData.patreonProgress/this.progressData.patreonGoal*100+"%"}}></div></div>
        <p class="support-modal-col-text">{"Goal: $" + this.progressData.patreonProgress+" / $" + this.progressData.patreonGoal + " per month"}</p>
        <button class="support-modal-button patreon-button" onClick={function(){window.open("https://www.patreon.com/WickEditor", "_blank")}}>
          <img src={patreonLogoWhite} alt="white patreon logo" class="support-modal-button-img"></img>
          <p class="support-modal-button-text">Become a Patron</p>
        </button>
      </div>
  
      <div class={(this.props.isMobile)?"support-modal-col":"support-modal-col right-col"}>
        <div class="support-modal-col-title">
          <img src={githubLogoWhite} alt="white github log" class="support-modal-col-title-img"></img>
          <p class="support-modal-col-title-text">GitHub Sponsors</p>
        </div>
        <p class="support-modal-col-text">for businesses and developers</p>
        <div class="support-modal-progress-bar"><div class="support-modal-github-progress" style={{width:this.progressData.githubProgress/this.progressData.githubGoal*100+"%"}}></div></div>
        <p class="support-modal-col-text">{"Goal: "+this.progressData.githubProgress+" of "+this.progressData.githubGoal +" sponsors found"}</p>
        <button class="support-modal-button github-button" onClick={function(){window.open("https://github.com/sponsors/Wicklets", "_blank")}}>
          <img src={githubHeart} alt="pink heart" class="support-modal-button-img"></img>
          <p class="support-modal-button-text">Sponsor</p>
        </button>
      </div>
    </Fragment>];

    const footerDisplay = [
      <Fragment>
      <p id="support-modal-follow-text">Follow us and share your work with <p id="support-modal-hashtag">#MadeWithWickEditor</p>!</p>
  
      <div id="support-modal-social-icons">
        <button class="support-modal-social-icon" onClick={function(){window.open("https://www.facebook.com/wickeditor/", "_blank")}}>
          <img class="support-modal-social-img" src={facebookIcon} alt="facebook logo"></img>
        </button>
        <button class="support-modal-social-icon" onClick={function(){window.open("https://www.instagram.com/wickeditor/", "_blank")}}>
          <img class="support-modal-social-img" src={instagramIcon} alt="instagram logo"></img>
        </button>
        <button class="support-modal-social-icon" onClick={function(){window.open("https://twitter.com/wickeditor", "_blank")}}>
          <img class="support-modal-social-img" src={twitterIcon} alt="twitter logo"></img>
        </button>
        <button class="support-modal-social-icon" onClick={function(){window.open("https://www.youtube.com/channel/UCXUM4laL0jXCO4wJjY15xqg", "_blank")}}>
          <img class="support-modal-social-img" src={youtubeIcon} alt="youtube logo"></img>
        </button>
      </div>
    </Fragment>];

    if (this.props.isMobile) {
      return this.renderMobileModal(contentDisplay, footerDisplay);
    } else {
      return this.renderDesktopModal(contentDisplay, footerDisplay);
    }
  }
}

export default SupportUs
