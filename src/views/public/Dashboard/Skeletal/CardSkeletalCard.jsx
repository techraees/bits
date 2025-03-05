import React from "react";

const CardSkeletalCard = () => {
  return (
    <div className="skeletal_parent_child">
      {/* Video Element */}
      <div className="skeletal_parent_child_video_element shimmer"></div>

      {/* Main Div */}
      <div className="skeletal_parent_child_bottom">
        {/* Flex With Button */}
        <div className="skeletal_parent_child_bottom_flex">
          <span className="skeletal_parent_child_bottom_flex__circle shimmer"></span>
          <div className="skeletal_parent_child_bottom_flex__button shimmer"></div>
        </div>

        <div className="skeletal_parent_child_bottom__text shimmer"></div>

        <div className="skeletal_parent_child_bottom__flex_with_icon">
          <div className="skeletal_parent_child_bottom__flex_with_icon__icon shimmer"></div>
          <div className="skeletal_parent_child_bottom__flex_with_icon__text shimmer"></div>
        </div>

        <div className="skeletal_parent_child_bottom__flex_with_icon">
          <div className="skeletal_parent_child_bottom__flex_with_icon__icon shimmer"></div>
          <div className="skeletal_parent_child_bottom__flex_with_icon__text shimmer"></div>
        </div>
        <div className="skeletal_parent_child_bottom__flex_with_button_with_icon">
          <div className="skeletal_parent_child_bottom__flex_with_button_with_icon__button shimmer"></div>
          <div className="skeletal_parent_child_bottom__flex_with_button_with_icon__icon shimmer"></div>
        </div>

        <div className="skeletal_parent_child_bottom__flex_button_with_text">
          <div className="skeletal_parent_child_bottom__flex_button_with_text_text shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default CardSkeletalCard;
