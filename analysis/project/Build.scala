/*
 * Build.scala
 * The Figaro Summer School 2015 project SBT build program.
 *
 * Created By:      Michael Reposa (mreposa@cra.com)
 * Creation Date:   Jul 02, 2015
 *
 * Copyright 2013 Avrom J. Pfeffer and Charles River Analytics, Inc.
 * See http://www.cra.com or email figaro@cra.com for information.
 *
 * See http://www.github.com/p2t2/figaro for a copy of the software license.
 */

import sbt._
import Keys._

object WifiCollectionBuild extends Build {

  override val settings = super.settings ++ Seq(
    scalaVersion := "2.11.6",
    javacOptions ++= Seq("-Djava.library.path", "./lib")
  )

  lazy val wifiCollection = Project("WifiCollection", file("."))
    .settings (scalacOptions ++= Seq(
	"-feature",
	"-language:existentials",
	"-deprecation",
	"-language:postfixOps"
    ))

    // Enable forking
    .settings(fork := true)
    // Increase max memory for JVM for both testing and runtime
    .settings(javaOptions in (Test,run) += "-Xmx8G")
    // Put all managed dependency libraries in /lib_managed
    // .settings(retrieveManaged := true)
    // Managed dependencies
    .settings(libraryDependencies ++= Seq(
      "com.cra.figaro" %% "figaro" % "3.2.1.1"
    ))
}
